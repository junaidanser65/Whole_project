// Simple sentiment analysis based on review ratings and comments
export const analyzeSentiment = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      label: 'No reviews yet',
      color: '#94A3B8'
    };
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  // Analyze comment sentiment (simple keyword-based approach)
  const positiveWords = [
    'excellent', 'amazing', 'great', 'good', 'wonderful', 'fantastic', 'perfect', 
    'outstanding', 'superb', 'brilliant', 'awesome', 'love', 'best', 'recommend',
    'satisfied', 'happy', 'pleased', 'delighted', 'impressed', 'professional'
  ];
  
  const negativeWords = [
    'terrible', 'awful', 'bad', 'poor', 'horrible', 'disappointing', 'worst',
    'unprofessional', 'rude', 'late', 'expensive', 'overpriced', 'disappointed',
    'unhappy', 'dissatisfied', 'angry', 'frustrated', 'annoyed', 'waste'
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  let totalComments = 0;

  reviews.forEach(review => {
    if (review.comment) {
      totalComments++;
      const comment = review.comment.toLowerCase();
      
      positiveWords.forEach(word => {
        if (comment.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (comment.includes(word)) negativeCount++;
      });
    }
  });

  // Calculate sentiment score (0-100)
  let sentimentScore = 0;
  
  // Rating contributes 70% to sentiment
  const ratingScore = (averageRating / 5) * 70;
  
  // Comment sentiment contributes 30%
  let commentScore = 0;
  if (totalComments > 0) {
    const commentSentiment = (positiveCount - negativeCount) / totalComments;
    commentScore = Math.max(0, Math.min(30, (commentSentiment + 1) * 15)); // Normalize to 0-30
  }
  
  sentimentScore = ratingScore + commentScore;

  // Determine sentiment category
  let sentiment, label, color;
  
  if (sentimentScore >= 80) {
    sentiment = 'very_positive';
    label = 'Excellent';
    color = '#10B981'; // Green
  } else if (sentimentScore >= 65) {
    sentiment = 'positive';
    label = 'Good';
    color = '#059669'; // Dark green
  } else if (sentimentScore >= 50) {
    sentiment = 'neutral';
    label = 'Average';
    color = '#F59E0B'; // Amber
  } else if (sentimentScore >= 35) {
    sentiment = 'negative';
    label = 'Poor';
    color = '#DC2626'; // Red
  } else {
    sentiment = 'very_negative';
    label = 'Very Poor';
    color = '#991B1B'; // Dark red
  }

  // Calculate confidence based on number of reviews
  const confidence = Math.min(100, Math.max(20, reviews.length * 10));

  return {
    sentiment,
    score: Math.round(sentimentScore),
    confidence: Math.round(confidence),
    label,
    color,
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  };
};

// Get sentiment icon based on sentiment type
export const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'very_positive':
      return '😍';
    case 'positive':
      return '😊';
    case 'neutral':
      return '😐';
    case 'negative':
      return '😞';
    case 'very_negative':
      return '😡';
    default:
      return '😐';
  }
};

// Get sentiment description
export const getSentimentDescription = (sentiment) => {
  switch (sentiment) {
    case 'very_positive':
      return 'Customers love this vendor!';
    case 'positive':
      return 'Customers are satisfied';
    case 'neutral':
      return 'Mixed customer feedback';
    case 'negative':
      return 'Some customer concerns';
    case 'very_negative':
      return 'Customer satisfaction issues';
    default:
      return 'No reviews available';
  }
}; 