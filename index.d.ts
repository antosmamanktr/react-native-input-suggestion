import { FC } from 'react';
import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface SuggestionInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  suggestion: string;
  inputTextColor?: string;
  suggestionTextColor?: string;
  placeholder?: string;
  textStyle: TextStyle;
  fillType?: 'textPress' | 'textDrag';
  caseSensitive: boolean;
  containerStyle: ViewStyle;
  showFillButton: boolean;
}

declare const SuggestionInput: FC<SuggestionInputProps>;

export default SuggestionInput;
