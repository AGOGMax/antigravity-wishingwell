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
      className=" !border-[8px] !border-agneonpink"
    >
      <Text
        size="large"
        style={{ margin: "0px", padding: "16px" }}
        className="!text-[#FF2FE6]"
      >
        Pink Mist Whale
      </Text>
    </PixelBorder>
  );
}
