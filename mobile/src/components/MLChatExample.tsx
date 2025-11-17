/**
 * Example ML Chat Component
 * Demonstrates how to use the ML hooks for a chat interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useMLModel } from '../hooks';
import { LLAMA_3_2_1B_Q4 } from '../ml/modelConfigs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const MLChatExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    isLoading,
    isDownloading,
    downloadProgress,
    error,
    loadModel,
    runInference,
    isModelLoaded,
  } = useMLModel(LLAMA_3_2_1B_Q4);

  const handleLoadModel = async () => {
    await loadModel();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !isModelLoaded || isGenerating) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Build conversation context
      const conversationContext = [...messages, userMessage]
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `${conversationContext}\nAssistant:`;

      const result = await runInference(prompt, {
        temperature: 0.7,
        maxTokens: 256,
      });

      if (result) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.text.trim(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to generate response:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ML Chat Demo</Text>
        {!isModelLoaded && (
          <TouchableOpacity
            style={styles.loadButton}
            onPress={handleLoadModel}
            disabled={isLoading || isDownloading}
          >
            {isLoading || isDownloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loadButtonText}>Load Model</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {isDownloading && downloadProgress && (
        <View style={styles.downloadProgress}>
          <Text style={styles.downloadText}>
            Downloading model: {downloadProgress.percentage.toFixed(1)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${downloadProgress.percentage}%` }]}
            />
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={styles.messageRole}>
              {message.role === 'user' ? 'You' : 'AI'}
            </Text>
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
        {isGenerating && (
          <View style={styles.loadingMessage}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Generating...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={isModelLoaded ? 'Type a message...' : 'Load model first'}
          editable={isModelLoaded && !isGenerating}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!isModelLoaded || isGenerating) && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={!isModelLoaded || isGenerating || !input.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  downloadProgress: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  downloadText: {
    marginBottom: 8,
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  errorText: {
    color: '#c62828',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
