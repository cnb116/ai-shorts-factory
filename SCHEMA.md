# Database Schema

This document defines the data structures used in the Shopping Shorts App, primarily designed for a NoSQL database (e.g., Firebase Firestore).

## Collections

### `users`
Stores user profile information, subscription status, and activity statistics.

```json
{
  "uid": "user_12345",              // Auth UID (Document ID)
  "email": "vibe_coder@gmail.com",
  "displayName": "바이브코더",
  "profileImage": "https://...",    // URL to profile image
  "tier": "free",                   // Subscription tier: 'free', 'pro', 'enterprise'
  "createdAt": "Timestamp",         // Server timestamp of registration
  "stats": {                        // User activity statistics
    "totalProjects": 15,            // Total number of projects created
    "publishedCount": 5             // Number of projects published/exported
  }
}
```

### Field Descriptions

*   **`uid`**: Unique Identifier for the user, typically provided by the Authentication service. Used as the Document ID.
*   **`email`**: User's email address.
*   **`displayName`**: Publicly visible name of the user.
*   **`profileImage`**: URL to the user's avatar image.
*   **`tier`**: Determines feature access levels (e.g., 'free' limits generations, 'pro' unlocks unlimited).
*   **`createdAt`**: Date and time when the user account was created.
*   **`stats`**: An object containing counters for user activity, useful for gamification or usage tracking.

### `projects`
Stores all data related to a specific shorts creation project, including input, AI generation results, and assets.

```json
{
  "id": "proj_abcde12345",          // Project Unique ID
  "ownerId": "user_12345",          // Owner UID (Reference to users collection)
  "isPublic": true,                 // Visibility status (e.g., exposed in Discover tab)
  "status": "completed",            // Status: 'draft', 'completed', 'published'
  
  // 1. Raw Input Data
  "inputData": {
    "productName": "무소음 마우스",
    "rawDescription": "도서관에서도 쓸 수 있는 조용한 클릭음..."
  },

  // 2. AI Generated Data (The Brain Output)
  // Stores the JSON output from the AI model as a Map
  "aiOutput": {
    "marketing_content": {
      "script": {
        "hook": "독서실 빌런이 되기 싫다면?",
        "body": "이 무소음 마우스는 30데시벨 이하로...",
        "cta": "프로필 링크에서 확인하세요!"
      },
      "landing_page": {
        "html_code": "<html>...</html>", // Full HTML code
        "color_theme": "#FF5733"
      },
      "image_prompt": "Quiet library desk setup, high quality...",
      "keywords": ["무소음마우스", "공부템", "도서관"]
    }
  },

  // 3. Media & Assets
  "assets": {
    "generatedImageUrl": "https://image.pollinations.ai/...", 
    "audioSettings": {
      "bgmType": "calm",           // User selected BGM mood
      "ttsVoice": "ko-KR-Standard-A" // Selected TTS voice
    },
    "finalVideoUrl": "https://storage.googleapis.com/..." // Path to the final uploaded video
  },

  // 4. Monetization
  "monetization": {
    "affiliateLink": "https://coupang.com/...", // User provided affiliate link
    "clicks": 0                                 // Link click tracking (future expansion)
  },

  // 5. Metadata
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Field Descriptions

*   **`id`**: Unique identifier for the project.
*   **`ownerId`**: The UID of the user who created this project.
*   **`isPublic`**: Boolean flag to determine if the project is visible to other users (e.g., in a community feed).
*   **`status`**: Current state of the project (`draft`: in progress, `completed`: generation done, `published`: uploaded).
*   **`inputData`**: The raw information provided by the user to start the generation.
*   **`aiOutput`**: The structured data returned by the AI, including the script, HTML code, and prompts.
*   **`assets`**: Links and settings for media files used or generated in the project.
*   **`monetization`**: Data related to revenue generation, such as affiliate links.
*   **`createdAt` / `updatedAt`**: Timestamps for project lifecycle management.
