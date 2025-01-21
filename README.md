# Planty 🌱

## Overview

Planty is a comprehensive mobile application designed to revolutionize plant care through technology. This app empowers plant enthusiasts to manage, track, and nurture their green companions with ease and intelligence.

## 🌟 Key Features

### 1. Plant Identification
- **Advanced Image Recognition**: Instantly identify plant species
- **Comprehensive Plant Profiles**: Detailed information about plant characteristics
- **Care Recommendations**: Personalized guidance based on plant type

### 2. Watering Management
- **Smart Scheduling**: Personalized watering reminders
- **Environmental Tracking**: Adjust care based on plant and environmental conditions
- **Watering History**: Track and log plant hydration

### 3. Health Monitoring
- **Real-time Notifications**: Alerts for watering, fertilizing, and plant health
- **Growth Tracking**: Monitor plant development over time
- **Diagnostic Tools**: Identify potential plant health issues

## 🛠 Technology Stack

- **Frontend**: 
  - React Native
  - Expo
  - TypeScript

- **Backend**:
  - Supabase
  - PostgreSQL

- **Authentication**: 
  - Supabase Authentication

- **State Management**:
  - React Context
  - Custom Hooks

## 📦 Prerequisites

- Node.js (v16+)
- npm or Yarn
- Expo CLI
- Supabase Account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/AgboganEmmanuel/planty.git
cd planty
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
The application uses environment variables configured in `app.json`. Ensure you have the following keys:

  "name": "planty",
    "extra": {
       `HUGGING_FACE_TOKEN`: Token for Hugging Face API
       `PLANTNET_API_KEY`: API key for PlantNet identification service
       `PLANTNET_API_ENDPOINT`: PlantNet API endpoint URL
       `PLANTNET_API_PROJECT`: PlantNet API project identifier
       `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
       `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous access key
    },



#### Security Note
🔒 **Important**: 
- Never commit sensitive API keys to version control
- Use environment-specific configurations
- Rotate API keys periodically

#### Example Configuration in `app.json`
```json
{
  "extra": {
    "HUGGING_FACE_TOKEN": "your_hugging_face_token",
    "PLANTNET_API_KEY": "your_plantnet_api_key",
    "PLANTNET_API_ENDPOINT": "https://your-plantnet-endpoint.org/v2/identify",
    "PLANTNET_API_PROJECT": "all",
    "NEXT_PUBLIC_SUPABASE_URL": "https://your-supabase-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your_supabase_anon_key"
  }
}
```

### 4. Run the Application
```bash
npx expo start
```

## 📱 Supported Platforms
- iOS
- Android
- Web (Limited)

## 🔧 Project Structure
```
planty/
│
├── app/                # Main application screens
│   ├── contexts/       # React context providers
│   ├── screens/        # Individual screen components
│   └── navigation/     # Navigation configuration
│
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── constants/          # App-wide constants
└── assets/             # Static assets (images, fonts)
```

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write clean, readable code
- Add appropriate comments
- Ensure test coverage

## 🐛 Reporting Issues
- Use GitHub Issues
- Provide detailed description
- Include steps to reproduce
- Share error logs or screenshots

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact
Emmanuel Agbogan
- Email: emmanuelagbogan@example.com
- GitHub: [@AgboganEmmanuel](https://github.com/AgboganEmmanuel)
- Twitter: [@emmanuelagbogan](https://twitter.com/emmanuelagbogan)

## 🌈 Acknowledgements
- [Expo](https://expo.dev)
- [Supabase](https://supabase.com)
- [React Native Community](https://reactnative.dev)

---

**Happy Plant Parenting with Planty! 🌿🌻**
