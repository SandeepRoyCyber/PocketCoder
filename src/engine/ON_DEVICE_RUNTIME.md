# On-device iOS runtime contract

PocketCoder supports an iPhone-native inference path through a React Native native module.

## Native module names

The JS layer looks for one of:
- `NativeModules.PocketCoderLLM`
- `NativeModules.PocketCoderOnDeviceLLM`

## Required method

```ts
generate(input: {
  model: string;
  system: string;
  prompt: string;
  format?: 'json';
}): Promise<string | { text?: string; output?: string; response?: string }>;
```

`generate` should return model output as either:
- a raw string, or
- an object with one of `text`, `output`, or `response`.

The output must include a valid JSON object that follows PocketCoder's schema prompt.
