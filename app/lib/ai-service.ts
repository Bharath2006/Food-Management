// Mock AI service for development - simulates food classification
// In production, you would use the actual Teachable Machine model

class AIService {
  private mockFoodTypes = [
    'bread', 'apple', 'banana', 'tomato', 'carrot', 'milk', 'cheese', 'chicken', 'beef', 'fish',
    'cake', 'cookie', 'muffin', 'orange', 'lettuce', 'yogurt', 'soup', 'beans', 'rice', 'pasta'
  ];

  async loadModel(): Promise<void> {
    // Mock model loading - always succeeds
    console.log('Mock AI model loaded successfully');
  }

  async classifyFood(imageElement: HTMLImageElement): Promise<{ className: string; probability: number }[]> {
    // Mock classification - returns random food type with high confidence
    const randomFood = this.mockFoodTypes[Math.floor(Math.random() * this.mockFoodTypes.length)];
    const confidence = 0.85 + Math.random() * 0.15; // 85-100% confidence
    
    return [{
      className: randomFood,
      probability: confidence
    }];
  }

  async classifyFoodFromFile(file: File): Promise<{ className: string; probability: number }[]> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock classification based on file name or random selection
    const fileName = file.name.toLowerCase();
    let detectedFood = '';
    
    // Try to detect food type from filename
    for (const foodType of this.mockFoodTypes) {
      if (fileName.includes(foodType)) {
        detectedFood = foodType;
        break;
      }
    }
    
    // If no match found, use random food type (excluding bread as default)
    if (!detectedFood) {
      const randomFoods = this.mockFoodTypes.filter(food => food !== 'bread');
      detectedFood = randomFoods[Math.floor(Math.random() * randomFoods.length)];
    }
    
    const confidence = 0.85 + Math.random() * 0.15; // 85-100% confidence
    
    return [{
      className: detectedFood,
      probability: confidence
    }];
  }

  getFoodCategory(prediction: string): string {
    const foodCategories: { [key: string]: string } = {
      'bread': 'bread',
      'cake': 'baked',
      'cookie': 'baked',
      'muffin': 'baked',
      'apple': 'fruits',
      'banana': 'fruits',
      'orange': 'fruits',
      'tomato': 'vegetables',
      'carrot': 'vegetables',
      'lettuce': 'vegetables',
      'milk': 'dairy',
      'cheese': 'dairy',
      'yogurt': 'dairy',
      'chicken': 'meat',
      'beef': 'meat',
      'fish': 'meat',
      'can': 'canned',
      'soup': 'canned',
      'beans': 'canned',
      'rice': 'grains',
      'pasta': 'grains'
    };

    const lowerPrediction = prediction.toLowerCase();
    for (const [key, category] of Object.entries(foodCategories)) {
      if (lowerPrediction.includes(key)) {
        return category;
      }
    }

    return 'other';
  }

  getEstimatedExpiry(foodCategory: string): Date {
    const now = new Date();
    const expiryDays: { [key: string]: number } = {
      'bread': 7,
      'baked': 5,
      'fruits': 7,
      'vegetables': 5,
      'dairy': 7,
      'meat': 3,
      'canned': 365,
      'grains': 30,
      'other': 7
    };

    const days = expiryDays[foodCategory] || 7;
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }

  getQuantityEstimate(prediction: string, imageSize: number): { quantity: number; unit: string } {
    // Simple estimation based on food type and image analysis
    const foodEstimates: { [key: string]: { quantity: number; unit: string } } = {
      'bread': { quantity: 1, unit: 'loaf' },
      'apple': { quantity: 6, unit: 'piece' },
      'banana': { quantity: 8, unit: 'piece' },
      'milk': { quantity: 1, unit: 'liter' },
      'cheese': { quantity: 500, unit: 'gram' },
      'chicken': { quantity: 1, unit: 'kilogram' },
      'tomato': { quantity: 1, unit: 'kilogram' },
      'carrot': { quantity: 1, unit: 'kilogram' },
      'cake': { quantity: 1, unit: 'piece' },
      'cookie': { quantity: 12, unit: 'piece' },
      'muffin': { quantity: 6, unit: 'piece' },
      'orange': { quantity: 8, unit: 'piece' },
      'lettuce': { quantity: 1, unit: 'piece' },
      'yogurt': { quantity: 500, unit: 'gram' },
      'soup': { quantity: 1, unit: 'liter' },
      'beans': { quantity: 400, unit: 'gram' },
      'rice': { quantity: 1, unit: 'kilogram' },
      'pasta': { quantity: 500, unit: 'gram' }
    };

    const lowerPrediction = prediction.toLowerCase();
    for (const [key, estimate] of Object.entries(foodEstimates)) {
      if (lowerPrediction.includes(key)) {
        return estimate;
      }
    }

    // Default estimate based on image size
    if (imageSize > 1000000) { // Large image
      return { quantity: 2, unit: 'kilogram' };
    } else if (imageSize > 500000) { // Medium image
      return { quantity: 1, unit: 'kilogram' };
    } else { // Small image
      return { quantity: 500, unit: 'gram' };
    }
  }
}

export const aiService = new AIService(); 