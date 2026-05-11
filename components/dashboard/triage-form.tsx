"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Cable,
  Cpu,
  HeartPulse,
  PlugZap,
  Thermometer,
  Unplug,
  Usb,
  Wind,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LiveVitals, TriageSessionVitals } from "@/types";

type TriageDraft = {
  spo2: string;
  temperature: string;
  heartRate: string;
};

type SerialConnectionStatus =
  | "not-connected"
  | "connecting"
  | "connected"
  | "disconnecting";

type SerialPortLike = {
  readable: ReadableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};

type SerialNavigator = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPortLike>;
  };
};

type SerialParseResult =
  | {
      ok: true;
      vitals: LiveVitals;
    }
  | {
      ok: false;
      error: string;
    };

const initialVitals: TriageDraft = {
  spo2: "",
  temperature: "",
  heartRate: "",
};

// Arduino should send exactly one complete reading per line with Serial.println().
// Preferred line: {"spo2":98,"temperature":36.8,"heartRate":76}
// Also accepted: HR=76 SpO2=98 TempC=36.8, 98,36.8,76,
// SPO2:98,TEMP:36.8,HR:76, or spo2=98,temp=36.8,hr=76.
const SERIAL_BAUD_RATE = 9600;
const ARDUINO_FORMAT_EXAMPLE =
  "HR=76 SpO2=98 TempC=36.8";

const emptyLiveVitals: LiveVitals = {
  spo2: null,
  temperature: null,
  heartRate: null,
};

function parseRequiredNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLiveVitals(vitals: LiveVitals): TriageSessionVitals | null {
  if (
    vitals.spo2 === null ||
    vitals.temperature === null ||
    vitals.heartRate === null
  ) {
    return null;
  }

  return {
    spo2: vitals.spo2,
    temperature: vitals.temperature,
    heartRate: vitals.heartRate,
  };
}

function parseSerialLine(line: string): SerialParseResult {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: "Received an empty serial line.",
    };
  }

  const parsedVitals =
    parseJsonVitals(trimmed) ??
    parseLabeledVitals(trimmed) ??
    parseCsvVitals(trimmed);

  if (!parsedVitals) {
    return {
      ok: false,
      error: `Received device data, but it was not in a recognized format: "${trimmed}".`,
    };
  }

  return validateSerialVitals(parsedVitals, trimmed);
}

function parseJsonVitals(line: string): LiveVitals | null {
  try {
    const parsed = JSON.parse(line) as Partial<
      Record<
        | "spo2"
        | "spO2"
        | "SPO2"
        | "oxygen"
        | "temperature"
        | "temp"
        | "TEMP"
        | "heartRate"
        | "heart_rate"
        | "hr"
        | "HR",
        unknown
      >
    >;

    return {
      spo2: readNumericValue(
        parsed.spo2 ?? parsed.spO2 ?? parsed.SPO2 ?? parsed.oxygen
      ),
      temperature: readNumericValue(
        parsed.temperature ?? parsed.temp ?? parsed.TEMP
      ),
      heartRate: readNumericValue(
        parsed.heartRate ?? parsed.heart_rate ?? parsed.hr ?? parsed.HR
      ),
    };
  } catch {
    return null;
  }
}

function parseLabeledVitals(line: string): LiveVitals | null {
  if (!/[=:]/.test(line)) {
    return null;
  }

  const fields = new Map<string, string>();

  // Scan labeled values anywhere in the line so Arduino output can be comma
  // separated or space separated, e.g. "HR=76 SpO2=98 TempC=36.8".
  for (const match of line.matchAll(
    /([a-zA-Z][a-zA-Z0-9_ -]*)\s*[:=]\s*([-+]?\d+(?:\.\d+)?)/g
  )) {
    fields.set(normalizeSerialKey(match[1]), match[2]);
  }

  if (fields.size === 0) {
    return null;
  }

  return {
    spo2: readNumericValue(
      fields.get("spo2") ?? fields.get("oxygen") ?? fields.get("o2")
    ),
    temperature: readNumericValue(
      fields.get("temperature") ??
        fields.get("temp") ??
        fields.get("tempc") ??
        fields.get("temp_c")
    ),
    heartRate: readNumericValue(
      fields.get("heartrate") ?? fields.get("heart_rate") ?? fields.get("hr")
    ),
  };
}

function parseCsvVitals(line: string): LiveVitals | null {
  const values = line.split(",").map((value) => value.trim());

  if (values.length !== 3 || values.some((value) => value === "")) {
    return null;
  }

  return {
    spo2: readNumericValue(values[0]),
    temperature: readNumericValue(values[1]),
    heartRate: readNumericValue(values[2]),
  };
}

function validateSerialVitals(
  vitals: LiveVitals,
  rawLine: string
): SerialParseResult {
  if (!hasAnyVital(vitals)) {
    return {
      ok: false,
      error: `No numeric vitals were found in serial line: "${rawLine}".`,
    };
  }

  const invalidFields: string[] = [];

  if (vitals.spo2 === null) {
    invalidFields.push("SpO2 is missing");
  } else if (vitals.spo2 < 0 || vitals.spo2 > 100) {
    invalidFields.push("SpO2 must be between 0 and 100");
  }

  if (vitals.temperature === null) {
    invalidFields.push("temperature is missing");
  } else if (vitals.temperature < 30 || vitals.temperature > 45) {
    invalidFields.push("temperature must be between 30 and 45 C");
  }

  if (vitals.heartRate === null) {
    invalidFields.push("heart rate is missing");
  } else if (vitals.heartRate < 20 || vitals.heartRate > 250) {
    invalidFields.push("heart rate must be between 20 and 250 bpm");
  }

  if (invalidFields.length > 0) {
    return {
      ok: false,
      error: `Invalid serial data "${rawLine}": ${invalidFields.join(", ")}.`,
    };
  }

  return {
    ok: true,
    vitals,
  };
}

function hasAnyVital(vitals: LiveVitals) {
  return (
    vitals.spo2 !== null ||
    vitals.temperature !== null ||
    vitals.heartRate !== null
  );
}

function readNumericValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSerialKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function serialVitalsToDraft(vitals: LiveVitals): TriageDraft {
  return {
    spo2: vitals.spo2?.toString() ?? "",
    temperature: vitals.temperature?.toString() ?? "",
    heartRate: vitals.heartRate?.toString() ?? "",
  };
}

function getSerialNavigator() {
  if (typeof navigator === "undefined") {
    return null;
  }

  return navigator as SerialNavigator;
}

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-xs font-medium uppercase tracking-normal text-slate-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold text-slate-950">
          {value ?? "--"}
        </span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export function TriageForm({
  disabled,
  disabledMessage,
  onSubmit,
  isSubmitting,
  submitLabel = "Begin Triage",
  footer,
}: {
  disabled: boolean;
  disabledMessage?: string;
  onSubmit: (vitals: TriageSessionVitals) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  footer?: ReactNode;
}) {
  const [draft, setDraft] = useState<TriageDraft>(initialVitals);
  const [manualError, setManualError] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [serialSupported, setSerialSupported] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<SerialConnectionStatus>("not-connected");
  const [deviceVitals, setDeviceVitals] = useState<LiveVitals>(emptyLiveVitals);
  const [receivedLines, setReceivedLines] = useState<string[]>([]);
  const [lastParseMessage, setLastParseMessage] = useState("");
  const portRef = useRef<SerialPortLike | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isDisconnectingRef = useRef(false);

  const hasCompleteDeviceVitals = normalizeLiveVitals(deviceVitals) !== null;

  useEffect(() => {
    setSerialSupported(Boolean(getSerialNavigator()?.serial));

    return () => {
      isDisconnectingRef.current = true;
      void readerRef.current?.cancel();
      void portRef.current?.close();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualError("");

    const parsedVitals = {
      spo2: parseRequiredNumber(draft.spo2),
      temperature: parseRequiredNumber(draft.temperature),
      heartRate: parseRequiredNumber(draft.heartRate),
    };

    if (
      parsedVitals.spo2 === null ||
      parsedVitals.temperature === null ||
      parsedVitals.heartRate === null
    ) {
      setManualError(
        "Please enter all live session measurements before continuing."
      );
      return;
    }

    await onSubmit(parsedVitals as TriageSessionVitals);
  }

  function updateDraft(field: keyof TriageDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function connectDevice() {
    setDeviceError("");
    setLastParseMessage("");

    const serial = getSerialNavigator()?.serial;

    if (!serial) {
      setSerialSupported(false);
      return;
    }

    try {
      setConnectionStatus("connecting");
      const port = await serial.requestPort();
      await port.open({ baudRate: SERIAL_BAUD_RATE });
      portRef.current = port;
      isDisconnectingRef.current = false;
      setConnectionStatus("connected");
      void readDeviceLines(port);
    } catch (error) {
      setConnectionStatus("not-connected");
      setDeviceError(
        error instanceof DOMException && error.name === "NotFoundError"
          ? "No device was selected. You can try connecting again when ready."
          : "Unable to connect to the serial device. Check the device and try again."
      );
    }
  }

  async function disconnectDevice() {
    setDeviceError("");
    isDisconnectingRef.current = true;
    setConnectionStatus("disconnecting");

    try {
      const reader = readerRef.current;
      const port = portRef.current;

      await reader?.cancel();

      try {
        reader?.releaseLock();
      } catch {
        // The read loop may already have released the stream lock.
      }

      await port?.close();
    } catch {
      setDeviceError("The device disconnected before the port could close cleanly.");
    } finally {
      readerRef.current = null;
      portRef.current = null;
      setConnectionStatus("not-connected");
    }
  }

  async function readDeviceLines(port: SerialPortLike) {
    if (!port.readable) {
      setDeviceError("The selected device is not sending readable data.");
      setConnectionStatus("not-connected");
      return;
    }

    const decoder = new TextDecoder();
    const reader = port.readable.getReader();
    readerRef.current = reader;
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        const chunk = decoder.decode(value, { stream: true });

        if (process.env.NODE_ENV !== "production") {
          console.info("[serial] raw chunk", chunk);
        }

        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          handleSerialLine(line);
        }
      }
    } catch {
      if (!isDisconnectingRef.current) {
        setDeviceError(
          "The device connection was interrupted. Reconnect when the sensor is ready."
        );
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // The lock may already be released after a browser-level disconnect.
      }

      if (!isDisconnectingRef.current) {
        readerRef.current = null;
        portRef.current = null;
        setConnectionStatus("not-connected");
      }
    }
  }

  function handleSerialLine(line: string) {
    const trimmed = line.trim();

    if (!trimmed) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[serial] line", trimmed);
    }

    setReceivedLines((current) => [trimmed, ...current].slice(0, 5));

    const parsed = parseSerialLine(trimmed);

    if (!parsed.ok) {
      setLastParseMessage(parsed.error);
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[serial] parsed values", parsed.vitals);
    }

    setDeviceVitals((current) => ({
      spo2: parsed.vitals.spo2 ?? current.spo2,
      temperature: parsed.vitals.temperature ?? current.temperature,
      heartRate: parsed.vitals.heartRate ?? current.heartRate,
    }));

    const nextDraft = serialVitalsToDraft(parsed.vitals);
    setDraft(nextDraft);

    if (process.env.NODE_ENV !== "production") {
      console.info("[serial] form fields updated", nextDraft);
    }

    setLastParseMessage("");
  }

  async function handleUseDeviceValues() {
    setDeviceError("");
    const parsedVitals = normalizeLiveVitals(deviceVitals);

    if (!parsedVitals) {
      setDeviceError(
        "Wait until SpO2, temperature, and heart rate are all received before beginning triage."
      );
      return;
    }

    await onSubmit(parsedVitals);
  }

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Check-Up</CardTitle>
        <CardDescription className="mt-2 text-base">
          Choose how to enter live measurements. Manual entry is always available,
          and supported browsers can read reviewed values from a USB serial device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {disabled ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            {disabledMessage ??
              "Complete the persistent patient profile first. Profile data is required context for future triage logic."}
          </Alert>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <HeartPulse className="size-4" />
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Manual Entry
                </Badge>
              </div>
              <div>
                <CardTitle className="text-lg">Manual Data Entry</CardTitle>
                <CardDescription className="mt-2">
                  Type the live vitals yourself and begin triage when ready.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spo2">SpO2 (%)</Label>
                    <div className="relative">
                      <Wind className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="spo2"
                        type="number"
                        min="0"
                        max="100"
                        className="h-11 pl-11"
                        disabled={disabled || isSubmitting}
                        value={draft.spo2}
                        onChange={(event) =>
                          updateDraft("spo2", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (C)</Label>
                    <div className="relative">
                      <Thermometer className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="temperature"
                        type="number"
                        min="30"
                        max="45"
                        step="0.1"
                        className="h-11 pl-11"
                        disabled={disabled || isSubmitting}
                        value={draft.temperature}
                        onChange={(event) =>
                          updateDraft("temperature", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                    <div className="relative">
                      <HeartPulse className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="heart-rate"
                        type="number"
                        min="20"
                        max="220"
                        className="h-11 pl-11"
                        disabled={disabled || isSubmitting}
                        value={draft.heartRate}
                        onChange={(event) =>
                          updateDraft("heartRate", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {manualError ? (
                  <Alert className="border-red-200 bg-red-50 text-red-700">
                    {manualError}
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  className="h-11 rounded-full px-6"
                  disabled={disabled || isSubmitting}
                >
                  {isSubmitting ? "Running triage..." : submitLabel}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Usb className="size-4" />
                </div>
                <Badge
                  variant={
                    connectionStatus === "connected" ? "default" : "secondary"
                  }
                  className="rounded-full"
                >
                  {!serialSupported
                    ? "Not Supported"
                    : connectionStatus === "connected"
                      ? "Connected"
                      : connectionStatus === "connecting"
                        ? "Connecting"
                        : connectionStatus === "disconnecting"
                          ? "Disconnecting"
                          : hasCompleteDeviceVitals
                            ? "Device Ready"
                            : "Not Connected"}
                </Badge>
              </div>
              <div>
                <CardTitle className="text-lg">USB / Serial Device</CardTitle>
                <CardDescription className="mt-2">
                  Connect an Arduino or sensor, review received values, then confirm
                  before triage begins.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Alert className="border-sky-200 bg-sky-50 text-sky-800">
                <AlertTitle>Expected Arduino output</AlertTitle>
                <AlertDescription>
                  Send one full line per reading at {SERIAL_BAUD_RATE} baud. Accepted:{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                    {ARDUINO_FORMAT_EXAMPLE}
                  </code>
                </AlertDescription>
              </Alert>

              {!serialSupported ? (
                <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                  <AlertTitle>Serial unavailable</AlertTitle>
                  <AlertDescription>
                    Serial device connection is not supported in this browser.
                    Please use Chrome/Edge or manual entry.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full"
                  disabled={
                    disabled ||
                    !serialSupported ||
                    connectionStatus === "connecting" ||
                    connectionStatus === "connected"
                  }
                  onClick={connectDevice}
                >
                  <PlugZap className="size-4" />
                  Connect Device
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full"
                  disabled={connectionStatus !== "connected"}
                  onClick={disconnectDevice}
                >
                  <Unplug className="size-4" />
                  Disconnect Device
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-950">
                  <Cable className="size-4 text-slate-500" />
                  Connection status
                </div>
                <p className="mt-1 text-slate-600">
                  {connectionStatus === "connected"
                    ? `Listening for serial data at ${SERIAL_BAUD_RATE} baud.`
                    : connectionStatus === "connecting"
                      ? "Waiting for browser device selection."
                      : connectionStatus === "disconnecting"
                        ? "Closing the serial connection."
                        : "No serial device connected."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="SpO2" value={deviceVitals.spo2} unit="%" />
                <MetricCard
                  label="Temp"
                  value={deviceVitals.temperature}
                  unit="C"
                />
                <MetricCard
                  label="Heart Rate"
                  value={deviceVitals.heartRate}
                  unit="bpm"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Cpu className="size-4" />
                  Device data preview
                </div>
                <div className="mt-3 space-y-2 font-mono text-xs text-slate-300">
                  {receivedLines.length > 0 ? (
                    receivedLines.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))
                  ) : (
                    <div>No data received yet.</div>
                  )}
                </div>
              </div>

              {lastParseMessage ? (
                <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                  {lastParseMessage}
                </Alert>
              ) : null}

              {deviceError ? (
                <Alert className="border-red-200 bg-red-50 text-red-700">
                  {deviceError}
                </Alert>
              ) : null}

              {!hasCompleteDeviceVitals ? (
                <p className="text-sm leading-6 text-slate-500">
                  Waiting for valid SpO2, temperature, and heart rate before device
                  values can be used.
                </p>
              ) : null}

              <Button
                type="button"
                className="h-11 rounded-full px-6"
                disabled={disabled || isSubmitting || !hasCompleteDeviceVitals}
                onClick={handleUseDeviceValues}
              >
                {isSubmitting ? "Running triage..." : "Use Device Values"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
