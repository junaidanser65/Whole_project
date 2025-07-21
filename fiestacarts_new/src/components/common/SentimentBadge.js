import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSentimentIcon, getSentimentDescription } from '../../services/sentimentAnalysis';

const SentimentBadge = ({ sentiment, label, color, score, confidence, size = 'medium' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: styles.smallIcon,
          label: styles.smallLabel,
          score: styles.smallScore
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: styles.largeIcon,
          label: styles.largeLabel,
          score: styles.largeScore
        };
      default:
        return {
          container: styles.mediumContainer,
          icon: styles.mediumIcon,
          label: styles.mediumLabel,
          score: styles.mediumScore
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor: color + '15' }]}>
      <Text style={[styles.icon, sizeStyles.icon]}>
        {getSentimentIcon(sentiment)}
      </Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, sizeStyles.label, { color }]}>
          {label}
        </Text>
        {score > 0 && (
          <Text style={[styles.score, sizeStyles.score, { color }]}>
            {score}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  icon: {
    marginRight: 6,
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: '600',
    fontSize: 12,
  },
  score: {
    fontWeight: '700',
    fontSize: 10,
    marginTop: 1,
  },
  
  // Small size
  smallContainer: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  smallIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  smallLabel: {
    fontSize: 10,
  },
  smallScore: {
    fontSize: 8,
  },
  
  // Medium size
  mediumContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediumIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  mediumLabel: {
    fontSize: 12,
  },
  mediumScore: {
    fontSize: 10,
  },
  
  // Large size
  largeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  largeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  largeLabel: {
    fontSize: 14,
  },
  largeScore: {
    fontSize: 12,
  },
});

export default SentimentBadge; 