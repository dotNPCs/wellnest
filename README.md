# WellNest

A gamified digital platform that makes mental health support approachable, stigma-free and seamlessly integrated into daily life.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Technical Architecture](#technical-architecture)
- [Team](#team)
- [Credits & Assets](#credits--assets)
- [Future Development](#future-development)
- [References](#references)

## Overview

WellNest is a gamified mental health platform where users check in with their emotions during meal times, journaling and reflections. These interactions are translated into the moods of their virtual pets using sentiment analysis. When users maintain positive habits and emotional well-being, their pets become happier and eventually join their collection (farm), unlocking new game pets.

### Target Audience
General population in Singapore, with particular focus on youth and young adults who may avoid traditional mental health resources due to stigma or accessibility concerns.

### Key Statistics
- 33% of youths aged 15-35 report severe or extremely severe symptoms of depression, anxiety, or stress
- 1 in 3 children and teens aged 10-18 experience anxiety or depression symptoms
- 17% of Singapore residents reported poor mental health in 2022, up from 13.4% in 2020

## Features

### Core Functionality

#### Daily Check-ins
- Users log their feelings during breakfast, lunch, and dinner
- Pets mirror the user's routine (e.g., pet eats when user does)
- Reinforces healthy daily habits through gamified accountability

#### Sentiment Analysis
- User inputs (check-ins, journaling, reflections) undergo real-time sentiment analysis
- Pet moods dynamically reflect user's emotional state
- AI patterns can predict potential mental well-being dips

#### Reminders and Journaling
- Personalized reminders triggered by pet moods
- Contextual notifications (e.g., hungry pet prompts user to eat)
- Journaling creates feedback loop: input → pet mood change → self-reflection

#### Farm System
- Pets gain happiness through consistent positive interactions
- Happy pets permanently join the user's farm
- Each pet has unique personality traits
- New pets randomly appear after previous ones join or leave

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm  package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dotNPCs/wellnest.git
cd wellnest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Environment Setup
Create a `.env.local` file in the root directory and add any necessary environment variables for your specific deployment.

## Technical Architecture

### Frontend
- **Next.js** - Responsive, performant and scalable web application framework
- **PixiJS/GSAP/HTML5 Canvas** - Interactive, animated pets and farm elements
- **Responsive Design** - Optimized for desktop and mobile experiences

### Backend
- **tRPC** - End-to-end type-safe APIs between frontend and backend
- **Serverless Functions** - Scalable backend infrastructure

### AI & Sentiment Analysis
- **Python Microservice** - Handles NLP tasks and sentiment analysis
- **Ollama** - Open-sourced models for privacy-focused, offline inference
- **Real-time Processing** - Immediate mood reflection in pet behavior

### Deployment
- **Vercel** - Fast global CDN distribution and seamless Next.js integration
- **Serverless Architecture** - Automatic scaling and cost optimization

### Design Methodology
- **User-Centered Design (UCD)** - Prototyping and usability testing with real users
- **Data-Driven Feedback** - Usage analytics guide platform refinements
- **Privacy by Design** - Open-source models minimize sensitive data sharing

## Team

### Team Name: .NPCs

| Role | Name | Email | Student ID |
|------|------|--------|------------|
| Team Leader | Chua Dong En | dongen.chua.2025@computing.smu.edu.sg | 01476635 |
| Member 2 | Yan Hein Latt | hl.yan.2025@computing.smu.edu.sg | 01524490 |
| Member 3 | Ashley Tan Min Yee | ashley.t.2025@computing.smu.edu.sg | 01529433 |
| Member 4 | Allison Margaret Loo Li Houng | allison.loo.2025@computing.smu.edu.sg | 01529155 |
| Member 5 | Evangeline Loh Qi Hui | evangelinel.2025@computing.smu.edu.sg | 01530392 |
| Member 6 | Enrico Tionardi Owen | enrico.owen.2025@computing.smu.edu.sg | 01532588 |

## Credits & Assets

### Fonts
- **PixiMix Pixel Font** by Andrew Tyler
  - Website: [www.AndrewTyler.net](http://www.andrewtyler.net)
  - Contact: font@andrewtyler.net

### Visual Assets
- **Pixel Cat Assets** - Pixel Cat Animation Pack (64x64)
  - Source: [last-tick on itch.io](https://last-tick.itch.io/pixel-cat-animation-pack-64x64)

- **Emoji Assets** - Emoji Comic Pack
  - Source: [narehop on itch.io](https://narehop.itch.io/emoji-comic-pack?download)

- **Background Assets**
  - Source: [CraftPix](https://craftpix.net/file-licenses/)

### Code Snippets
- [List any code snippets used with GitHub repository/username attribution]

### Libraries & Frameworks
- Next.js - React framework for production
- tRPC - End-to-end typesafe APIs
- PixiJS - 2D rendering engine
- GSAP - Animation library
- Ollama - Local AI model inference

### Research & References
All academic sources and research papers are listed in the References section below.

## Future Development

### Planned Features

#### Social Town
- Users can visit friends' farms and interact with their pets
- Peer support through positive reinforcement exchanges
- Community well-being beyond individual self-care

#### Voice Integration
- AI-powered speech-to-text (STT) and text-to-speech (TTS)
- Voice-based pet interactions for on-the-go mood tracking
- More personal and convenient user experience

#### Mobile Application
- Transition from web-based platform to dedicated mobile app
- Enhanced push notifications and mobile journaling
- Deeper integration with daily routines and habits

#### Seasonal Content
- Limited-time pets reflecting cultural events and Singaporean traditions
- Seasonal challenges and activities
- Fresh content to maintain long-term engagement

## Impact & Success Metrics

### Key Performance Indicators (KPIs)

#### Engagement and Consistency
- Average number of log-ins per user per week
- Consistency of daily check-ins over time

#### Emotional Progress
- Number of journaling entries completed per user
- Improvement in sentiment trends over time

#### Gamification Success
- Average number of animals unlocked per user's farm
- Rate of farm growth across user base

#### Well-being Impact
- User surveys on self-awareness and emotional literacy
- User retention rates and long-term engagement

## References

Ganesan, N. (28 September, 2023). Prevalence of poor mental health increasing in Singapore; young adults have highest proportion at 25.3%. Channel News Asia. Retrieved 8 August, 2025, from https://www.channelnewsasia.com/singapore/poor-mental-health-young-adults-seek-help-moh-survey-3802531

Gkintoni, E., Vantaraki, F., Skoulidi, C., Anastassopoulos, P., & Vantarakis, A. (2024). Gamified Health Promotion in Schools: The Integration of Neuropsychological Aspects and CBT—A Systematic Review. MDPI. Retrieved 8 August, 2025, from https://www.mdpi.com/1648-9144/60/12/2085

Griffen, T. C., Naumann, E., & Hildebrandt, T. (November, 2018). Mirror exposure therapy for body image disturbances and eating disorders: A review. Clinical Psychology Review, 163-174. Retrieved 8 August, 2025, from https://www.sciencedirect.com/science/article/abs/pii/S0272735818300576

Grouport Therapy. (8 February, 2023). The Benefits of Cognitive Behavior Therapy Journal Applications. Retrieved 8 August, 2025, from https://www.grouporttherapy.com/blog/cbt-journal-app

Low, Y. (13 January, 2025). 1 in 3 adolescents report depression, anxiety but only 10% of parents can spot mental health issues: NUS-led study. Channel News Asia. Retrieved 8 August, 2025, from https://www.channelnewsasia.com/singapore/1-3-adolescents-depression-anxiety-only-1-10-parents-spot-symptoms-4629721

Teo, J. (19 September, 2024). Depression, anxiety, stress: 1 in 3 youth in S'pore reported very poor mental health, says IMH survey. The Straits Times. Retrieved 8 August, 2025, from https://www.straitstimes.com/singapore/health/depression-anxiety-stress-1-in-3-youth-in-s-pore-had-had-very-poor-mental-health-says-imh-survey

University of Michigan. (2016). Behavioral Activation for Depression. Michigan: University of Michigan. Retrieved 8 August, 2025, from https://medicine.umich.edu/sites/default/files/content/downloads/Behavioral-Activation-for-Depression.pdf

---

## Contact

For questions or support, please contact the Team Leader Dong En at at [dongen.chua.2025@computing.smu.edu.sg].
