import { PixelBorder, Text } from "nes-ui-react";

export default function PMWTitle() {
  return (
    <PixelBorder
      doubleSize
      doubleRoundCorners
      style={{
        width: "max-content",
        padding: "8px 16px",
        marginBottom: "16px",
      }}
    >
      <Text size="large" style={{ margin: "0px", padding: "16px" }}>
        Pink Mist Whale
      </Text>
    </PixelBorder>
  );
}
