import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  TextStyle,
  Pressable,
  TextInputProps,
  ViewStyle,
} from 'react-native';

const { width } = Dimensions.get('window');

const fontStyleKeys = [
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontFamily',
  'letterSpacing',
  'textAlign',
  'textTransform',
];
const inputStyleKeys = [
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontFamily',
  'letterSpacing',
  'textAlign',
  'textTransform',
  'height',
];

interface Props extends TextInputProps {
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
const SuggestionInput: React.FC<Props> = ({
  value,
  onChangeText,
  suggestion,
  inputTextColor = 'black',
  suggestionTextColor = 'gray',
  placeholder = 'Type here...',
  textStyle,
  fillType = 'textPress',
  caseSensitive = false,
  containerStyle = {},
  showFillButton = false,
  ...props
}) => {
  // const [value, onChangeText] = useState('');
  const inputTextRef = useRef(''); // Holds latest value
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [fullText, setFullText] = useState(suggestion);
  // const fullText = 'An apple is there';
  const prevTextRef = useRef('');
  const flattenedStyle = StyleSheet.flatten(textStyle) || {};

  const restTextStyles = Object.fromEntries(
    Object.entries(flattenedStyle).filter(([key]) =>
      fontStyleKeys.includes(key),
    ),
  );
  const restInputStyles = Object.fromEntries(
    Object.entries(flattenedStyle).filter(([key]) =>
      inputStyleKeys.includes(key),
    ),
  );

  useEffect(() => {
    setFullText(suggestion);
  }, [suggestion]);

  const startsWith = (source: string, target: string): boolean => {
    if (!caseSensitive) {
      return source.toLowerCase().startsWith(target.toLowerCase());
    }
    return source.startsWith(target);
  };

  const handleTextChange = (text: string) => {
    const prevText = prevTextRef.current;
    const isBackspace = text.length < prevText.length;

    onChangeText(text);
    inputTextRef.current = text;
    prevTextRef.current = text;

    if (text.length > 0 && startsWith(fullText, text) && !isBackspace) {
      setShowSuggestion(true);
    } else {
      setShowSuggestion(false);
    }
  };

  const remainingText = fullText.slice(value.length);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx; // Horizontal movement
        if (dx > 0) {
          const charsToReveal = Math.min(
            Math.floor(dx / 25), // Estimate: 10px per character
            fullText.length - inputTextRef.current.length,
          );

          const newText = fullText.slice(
            0,
            inputTextRef.current.length + charsToReveal,
          );

          onChangeText(newText);
          inputTextRef.current = newText; // update ref
        }
      },
      onPanResponderRelease: () => {
        // Still show remaining text if not fully filled
        const current = inputTextRef.current;
        if (
          current.length > 0 &&
          current.length < fullText.length &&
          fullText.startsWith(current)
        ) {
          setShowSuggestion(true);
        } else {
          setShowSuggestion(false);
        }
      },
    }),
  ).current;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, restInputStyles, { color: inputTextColor }]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            multiline={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={true}
            {...props}
          />
          {isFocused && showSuggestion && remainingText.length > 0 && (
            <>
              {fillType == 'textPress' && (
                <Pressable
                  style={styles.suggestionOverlay}
                  {...panResponder.panHandlers}
                  onPress={() => {
                    onChangeText(fullText);
                    setShowSuggestion(false);
                  }}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      restTextStyles,
                      { color: suggestionTextColor },
                    ]}
                  >
                    <Text style={[styles.transparentText, restTextStyles]}>
                      {fullText.slice(0, value.length)}
                    </Text>
                    {remainingText}
                  </Text>
                  {showFillButton && (
                    <Pressable
                      onPress={() => {
                        onChangeText(fullText);
                        setShowSuggestion(false);
                      }}
                      style={styles.fillButton}
                    >
                      <Text style={styles.fillButtonText}>Fill</Text>
                    </Pressable>
                  )}
                </Pressable>
              )}
              {fillType == 'textDrag' && (
                <View
                  style={styles.suggestionOverlay}
                  {...panResponder.panHandlers}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      restTextStyles,
                      { color: suggestionTextColor },
                    ]}
                  >
                    <Text style={[styles.transparentText, restTextStyles]}>
                      {fullText.slice(0, value.length)}
                    </Text>
                    {remainingText}
                  </Text>
                  {showFillButton && (
                    <Pressable
                      onPress={() => {
                        onChangeText(fullText);
                        setShowSuggestion(false);
                      }}
                      style={styles.fillButton}
                    >
                      <Text style={styles.fillButtonText}>Fill</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Debug Info (Optional) */}
      {/* <Text style={{ marginTop: 30 }}>remainingText: {remainingText}</Text>
      <Text>value: {value}</Text>
      <Text>First remainingText {fullText.slice(0, value.length)}</Text>
      <Text>showSuggestion {showSuggestion.toString()}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderRadius: 10,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  input: {
    fontSize: 15,
    color: 'black',
    letterSpacing: 0.06,
    padding: 0,
    width: width,
    minHeight: 40,
  },
  suggestionOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 15,
    color: 'gray',
    letterSpacing: 0.06,
  },
  transparentText: {
    fontSize: 15,
    color: 'transparent',
    letterSpacing: 0.06,
  },
  fillButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 20,
    paddingHorizontal: 6,
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginLeft: 5,
  },
  fillButtonText: {
    fontSize: 12,
    color: '#ccc',
  },
});

export default SuggestionInput;
