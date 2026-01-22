import React from "react";
import { View } from "react-native";

interface Props {
  current: number;
  max: number;
  color: string;
  backgroundColor: string;
  height?: number;
}

export const StatBar = ({
  current,
  max,
  color,
  backgroundColor,
  height = 8,
}: Props) => {
  // Garante entre 0% e 100%
  const percent = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: "hidden",
      }}
    >
      <View
        style={{ width: `${percent}%`, backgroundColor: color, height: "100%" }}
      />
    </View>
  );
};
