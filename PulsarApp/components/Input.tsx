import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface Props {
  placeholder: string;
  style?: TextInputProps['style'];
}

function Input({ placeholder, style, ...props }: Props & TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const dynamicStyle = {
    fontSize: isFocused ? 25 : 16,
    paddingVertical: isFocused ? 13 : 18,
  };

  return (
    <TextInput
      style={[styles.input, dynamicStyle, style]}
      placeholder={isFocused ? '' : placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      keyboardType="decimal-pad"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 4,
    paddingHorizontal: 10,
    borderColor: '#B5E1F1',
    borderWidth: 2,
    color: '#001A72',
  },
});

export default Input;