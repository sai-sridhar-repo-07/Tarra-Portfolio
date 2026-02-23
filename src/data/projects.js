export const projects = [
  {
    id: 'demandcast',
    title: 'DemandCast',
    subtitle: 'Large-Scale Demand Forecasting System',
    description: 'End-to-end demand forecasting pipeline for predicting daily SKU-level demand across 50K+ products using deep learning and classical ML models.',
    longDescription: `Built a scalable forecasting system comparing ARIMA, Prophet, XGBoost, and LSTM models. Implemented LSTM with Temporal Attention achieving 22% lower MAPE compared to ARIMA baseline.

Designed a real-time inference API using FastAPI with Redis caching. Added model monitoring to detect data drift and trigger automated retraining when performance degrades.`,
    tech: ['Python', 'PyTorch', 'XGBoost', 'FastAPI', 'Kafka', 'Redis', 'PostgreSQL'],
    category: 'Machine Learning',
    gradient: 'from-emerald-600 to-cyan-600',
    accentColor: '#10B981',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07',
    featured: true,
    status: 'Ongoing',
    stars: 0,
    images: ['/projects/demandcast-1.png'],
    metrics: [
      { label: 'MAPE Improvement', value: '22%' },
      { label: 'Products Modeled', value: '50K+' },
    ],
  },
  {
    id: 'skillswap',
    title: 'SkillSwap',
    subtitle: 'Peer-to-Peer Microlearning Platform',
    description: 'Live microlearning platform with credit-based economy and real-time video sessions.',
    longDescription: `Built a full-stack real-time learning platform using React, Node.js, MongoDB, and PostgreSQL.

Integrated WebRTC for live video and whiteboard sessions. Designed transactional credit logic where users earn credits by teaching and spend credits while learning. Implemented booking system and reputation tracking.`,
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'WebRTC', 'Tailwind CSS'],
    category: 'Full Stack',
    gradient: 'from-cyan-600 to-blue-600',
    accentColor: '#06B6D4',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07',
    featured: true,
    status: 'Completed',
    stars: 0,
    images: ['/projects/skillswap-1.png'],
    metrics: [
      { label: 'Session Type', value: 'Live P2P' },
      { label: 'Architecture', value: 'Full Stack' },
    ],
  },
  {
    id: 'stock-forecast',
    title: 'Explainable Stock Forecasting Engine',
    subtitle: 'Interpretable ML for Stock Prediction',
    description: 'Stock price forecasting engine with explainability using feature importance and model interpretation techniques.',
    longDescription: `Built a stock forecasting system using machine learning models and incorporated explainability techniques to interpret feature impact on predictions.

Focused on transparency and financial data analysis using Pandas and visualization tools.`,
    tech: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    category: 'Machine Learning',
    gradient: 'from-purple-600 to-indigo-600',
    accentColor: '#7C3AED',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07/Explainable-Stock-Forecasting-Engine',
    featured: false,
    status: 'Completed',
    stars: 0,
    images: ['/projects/stock-1.png'],
    metrics: [
      { label: 'Focus', value: 'Explainability' },
    ],
  },
  {
    id: 'social-pulse',
    title: 'Real-Time Social Pulse Analyzer',
    subtitle: 'Trend & Sentiment Detection System',
    description: 'Analyzes social media trends and sentiment in real-time using NLP techniques.',
    longDescription: `Built an NLP-based system to detect trending topics and analyze sentiment from streaming social data.

Focused on real-time data processing and visualization of trend dynamics.`,
    tech: ['Python', 'NLP', 'Pandas', 'Stream Processing'],
    category: 'Data Engineering',
    gradient: 'from-rose-600 to-pink-600',
    accentColor: '#F43F5E',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07/Real-Time-Social-Pulse-Analyzer',
    featured: false,
    status: 'Completed',
    stars: 0,
    images: ['/projects/social-1.png'],
    metrics: [
      { label: 'Type', value: 'Real-time Analysis' },
    ],
  },
  {
    id: 'route-intelligence',
    title: 'Adaptive Real-Time Route Intelligence Engine',
    subtitle: 'A* and Bidirectional Dijkstra Optimization',
    description: 'High-performance pathfinding engine using A* and Bidirectional Dijkstra algorithms.',
    longDescription: `Implemented optimized shortest-path algorithms including A* and Bidirectional Dijkstra for efficient real-time route computation.

Focused on algorithmic efficiency and performance benchmarking.`,
    tech: ['C++', 'Data Structures', 'Algorithms'],
    category: 'Algorithms',
    gradient: 'from-amber-600 to-orange-600',
    accentColor: '#F59E0B',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07/Adaptive-Real-Time-Route-Intelligence-Engine-using-A-and-Bidirectional-Dijkstra',
    featured: false,
    status: 'Completed',
    stars: 0,
    images: ['/projects/route-1.png'],
    metrics: [
      { label: 'Algorithms Used', value: 'A*, Bi-Dijkstra' },
    ],
  },
  {
    id: 'genai-chatbot',
    title: 'Gen AI Chatbot',
    subtitle: 'LLM-powered Conversational Assistant',
    description: 'Conversational chatbot built using generative AI concepts and prompt engineering.',
    longDescription: `Developed a chatbot leveraging LLM fundamentals and prompt engineering techniques.

Focused on conversational flow design and practical GenAI experimentation.`,
    tech: ['Python', 'LLMs', 'Prompt Engineering'],
    category: 'AI Applications',
    gradient: 'from-indigo-600 to-purple-600',
    accentColor: '#6366F1',
    liveUrl: null,
    githubUrl: 'https://github.com/sai-sridhar-repo-07/Gen-AI-Chatbot',
    featured: false,
    status: 'Completed',
    stars: 0,
    images: ['/projects/chatbot-1.png'],
    metrics: [
      { label: 'Type', value: 'Generative AI' },
    ],
  },
]

export const categories = [
  'All',
  'Machine Learning',
  'Full Stack',
  'Data Engineering',
  'Algorithms',
  'AI Applications'
]