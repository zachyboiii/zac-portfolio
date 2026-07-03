import vroomImg from './vroom.png'
import squidImg from './squid_game.png'
import arcadeImg from './mini_arcade.png'
import kebunImg from './kebunfresh.png'
import calcImg from './calc.png'
import teleImg from './telebot.png'
import truthieImg from './truthiego.png'
import hotelImg from './hotel-ease.png'
import storehouseImg from './storehouse.png'
import chessImg from './chess.png'
import zacaiImg from './smiskiIcon.svg'
import worldcupImg from './worldcup-sim.png'
import desktopPetImg from './desktop-pet.png'
import desktopPetZip from './desktop-pet.zip'

const work_data = [
    {
        id: "zac-ai",
        w_title: "zac.ai",
        w_date: "Jun 26 - Jun 26",
        w_desc: "Personal Project: RAG chatbot embedded in this portfolio that answers questions about me, grounded in my resume and project data.",
        short_desc: "RAG chatbot that answers questions about Zac.",
        long_desc:`zac.ai is the chatbot living on this very website — an end-to-end Retrieval-Augmented Generation (RAG) pipeline that grounds every answer in my actual resume, work experience, and project data.

The knowledge base is built by an embedding pipeline that parses my resume and structured site data, chunks it into self-contained semantic units, and encodes each chunk into 384-dimensional dense vectors using the all-MiniLM-L6-v2 sentence transformer. At query time, the user's question is embedded with the same model via Transformers.js, and a cosine similarity search ranks the knowledge base to retrieve the top-k most relevant chunks. Only this retrieved context is injected into the LLM prompt — grounding generation, reducing hallucination, and keeping token usage low.

Responses are streamed token-by-token from the LLM, with a regex fast path that answers greetings and small talk instantly without an inference call. The bot also speaks Gen Z Singlish, so go ahead and ask it anything about me la.`,
        w_languages: ['React.js', 'Transformers.js', 'RAG', 'Node.js'],
        w_link: "https://zachyboiii.github.io/zac-portfolio/",
        w_img: zacaiImg,
        youtube: null,
        opens_zacai: true,
        img_small: true,
        category: "AI/ML"
    },
    {
        id: "worldcup-sim",
        w_title: "World Cup Predictor",
        w_date: "Jun 26 - Jun 26",
        w_desc: "Personal Project: ML pipeline that predicts World Cup match outcomes using gradient boosting models trained on 48,000+ historical international matches.",
        short_desc: "ML pipeline that predicts World Cup match outcomes.",
        long_desc:`World Cup Simulator is a Python ML pipeline that trains match prediction models across every stage of a World Cup: a full-time outcome classifier (W/D/L), home and away goals regressors, an extra-time score model, and a penalty shootout classifier. Three gradient boosting algorithms were benchmarked for each task — LightGBM, XGBoost, and CatBoost — selected for their dominance on tabular sports ML benchmarks.

Model selection used a chronological 80/20 train/test split to prevent data leakage, with the test set representing the most recent 20% of matches. Champions were chosen by weighted F1 (classifiers) and MAE (regressors). Secondary metrics included ROC-AUC (macro one-vs-rest), log loss, Brier score, and RMSE. Training weights were applied to up-rank recent matches, high-Elo fixtures, World Cup data (especially 2022), and top-5 league squads — so the model learns from the matches that most resemble WC2026 conditions.

The 38-feature vector covers Elo ratings, 5- and 10-game rolling form, goals averages, head-to-head records, World Cup-specific stats, tournament experience, disciplinary data, and penalty rates. The pipeline is tracked with MLflow and champion models are serialised via joblib.`,
        w_languages: ['Python', 'LightGBM', 'XGBoost', 'CatBoost', 'scikit-learn', 'MLflow'],
        w_link: "https://github.com/zachyboiii",
        w_img: worldcupImg,
        youtube: null,
        img_rounded: true,
        category: "AI/ML"
    },
    {
        id: "desktop-pet",
        w_title: "Desktop Pet",
        w_date: "Jun 26 - Jun 26",
        w_desc: "Personal Project: A Tauri desktop app that lets you adopt a pixel-art pet that lives on your screen, walks around, and reacts to your mouse.",
        short_desc: "Pixel-art desktop pet that lives on your screen.",
        long_desc:`Desktop Pet is a Tauri v2 app that renders a transparent, always-on-top window housing an animated pixel-art companion. The pet walks across your desktop, idles, and reacts to cursor proximity — all driven by a canvas-based sprite animation engine built from scratch.

The pet canvas runs in a dedicated Vite + React window with a fully transparent background, while a separate dashboard window lets you customise your pet: choose from cats, dogs, or a slime, pick a colour variant, and adjust personality settings. Both windows communicate via Tauri's event system.

The animation engine (PetEngine.js) manages sprite sheet slicing, frame cycling, directional movement, and state transitions (idle, walk, sit, react). Pets are aware of the mouse cursor position and switch to a "react" state when you hover nearby. A phrase bubble pops up at random intervals, pulling from a JSON phrase bank to give the pet a bit of personality.`,
        w_languages: ['Tauri', 'React', 'JavaScript', 'Rust'],
        w_link: "https://github.com/zachyboiii",
        w_img: desktopPetImg,
        youtube: null,
        download_file: desktopPetZip,
        img_small: true,
        category: "SWE"
    },
    {
        id: "chess-ai",
        w_title: "Chess AI",
        w_date: "Jan 26 - Jan 26",
        w_desc: "Personal Project: Developed an AI agent capable of playing chess using deep learning.",
        short_desc: "AI Chess agent that plays chess using deep learning.",
        long_desc:`Developed a deep learning chess move prediction system using PyTorch and supervised learning on elite Lichess game data. Raw PGNs were transformed into board-state training examples, with each position labeled by the expert move actually played. Board states were represented as a 13-channel 8×8 tensor: 6 channels for white pieces, 6 for black, and 1 channel indicating side to move.

The model was implemented in PyTorch using a convolutional neural network (CNN) architecture composed of stacked Conv2D layers (13→64→128 with 3×3 kernels and ReLU activations), followed by flattening and fully connected layers (8192→256→moves). Leveraging PyTorch’s tensor operations, autograd, and modular training interface, the pipeline efficiently learned spatial patterns from expert play and generalized them to produce strong move predictions directly from board configurations.`,
        w_languages: ['Python', 'PyTorch', 'Streamlit', 'NumPy'],
        w_link: "https://github.com/zachyboiii/chess-ai",
        w_img: chessImg,
        youtube: null,
        category: "AI/ML"
    },
    {
        id: "storehouse",
        w_title: "The Storehouse",
        w_date: "Dec 25 - Jan 26",
        w_desc: "Volunteer Project: Full stack web application to help streamline delivery management for a non-profit organization.",
        short_desc: "Full stack web app to streamline delivery management for a non-profit organization.",
        long_desc:`Contributed to a full-stack delivery management platform supporting a volunteer organization in coordinating and scheduling deliveries to beneficiaries. Implemented RESTful backend services using Node.js, Express.js, and PostgreSQL to support full CRUD workflows for deliveries, including creation, scheduling, assignment, and status updates.
        
        On the frontend, developed responsive UI features with vanilla JavaScript, HTML, and CSS, including a Google Calendar–style interactive delivery calendar, form-driven delivery creation, and edit/delete capabilities. The platform improved visibility, reduced scheduling errors, and streamlined operational coordination for volunteers and administrators.`,
        w_languages: ['JavaScript', 'PostgreSQL', 'Express.js', 'Node.js', 'HTML', 'CSS'],
        w_link: "https://github.com/zachyboiii/The-Storehouse",
        w_img: storehouseImg,
        youtube: null,
        category: "Full Stack Dev"
    },
    {
        id: "hotel-ease",
        w_title: "Hotel Ease",
        w_date: "May 25 - Aug 25",
        w_desc: "School Based Project: Full stack web application developed to streamline hotel operations and enhance guest experiences.",
        short_desc: "Full stack web app to streamline hotel operations and enhance guest experiences.",
        long_desc:`Developed a full-stack hotel booking platform integrated with Ascenda Loyalty that enables users to search, compare, and book hotels with real-time pricing and loyalty redemption options. The frontend was built with React.js, delivering a responsive search experience with lazy loading, dynamic filtering/sorting, and an interactive Mapbox-powered visualization to explore hotel clusters visually.
        
        On the backend, architected RESTful APIs using Express.js and MongoDB, implementing secure session-based authentication, role-based access, and optimized endpoints for hotel price aggregation and search performance. The system was fully tested end-to-end, reaching 90%+ code coverage across core workflows including booking, authentication, and hotel search. The platform emphasizes performance, usability, and reliability, showcasing end-to-end product design from UI to backend infrastructure.`,
        w_languages: ['TypeScript', 'MongoDB', 'Express.js', 'Node.js', 'React Native', 'Jest'],
        w_link: "https://github.com/zachyboiii/HotelEase_SUTD",
        w_img: hotelImg,
        youtube: "https://youtube.com/embed/FRKDSMAWDbY",
        category: "Full Stack Dev"
    },
    {
        id: "truthie-go",
        w_title: "TruthieGo",
        w_date: "May 25 - Jun 25",
        w_desc: "Hackathon: Monopoly Go inspired game developed using Godot Engine to help raise awareness on cyber threats.",
        short_desc: "Mobile game designed to raise awareness on scams and misinformation.",
        long_desc:`As part of DSTA's BrainHack 2025, my group and I designed and developed a game to address the problem statement: 
“How might we gamify an experience to teach users real-world skills to detect, report, and counter misinformation and cyber threats in a fun and rewarding way?”

Introducing TruthieGO — a locally themed 2D board game designed for Singaporeans of all ages. Players roll the dice, move their avatars, and encounter mini-games simulating real-life scams and misinformation. Along the way, they earn TruthBucks and CyberShields, our in-game currency, reinforcing good cybersecurity habits.
Unlike traditional methods, TruthieGO doesn't just inform, it engages. We make learning fun, interactive, and relatable, ensuring the lessons stick.

Achievements: Champion in CODE_EXP Competitive Category`,
        w_languages: ['Godot', 'Firebase'],
        w_link: "https://github.com/zachyboiii/TruthieGO",
        w_img: truthieImg,
        youtube: "https://youtube.com/embed/Zm7gRWYisLM",
        category: "Others"
    },
    {
        id: "vroom",
        w_title: "Vroom",
        w_date: "Jan 25 - Apr 25",
        w_desc: "School Based Project: Android App implemented using java to connect private driving instructors with students.",
        short_desc: "Android app designed to connect private driving instructors with students.",
        long_desc:`Vroom is a mobile application designed to connect learner drivers with certified driving instructors in Singapore. The app streamlines the learning-to-drive process with key features such as:

- Instructor discovery and profile browsing
- Booking and scheduling driving lessons
- In-app chat with simulated instructor responses via GPT-3.5 Turbo LLM
- Lesson reminders and theory test quizzes

This project demonstrates full-stack mobile app development, backend integration, algorithm design, and prompt engineering in an educational context.`,
        w_languages: ['Java', 'Android Studio'],
        w_link: "https://github.com/zachyboiii/Vroom",
        w_img: vroomImg,
        youtube: "https://youtube.com/embed/fScXZ4dp-mY",
        category: "SWE"
    },
    {
        id: "squid-game",
        w_title: "Glass Bridge Game",
        w_date: "Jan 25 - Apr 25",
        w_desc: "School Based Project: Arcade-style game inspired by Squid Game’s glass bridge challenge, implemented on an FPGA board using Lucid HDL.",
        short_desc:"Squid Game's Glass Bridge game implemented on an FPGA, arcade style.",
        long_desc:`Beyond game mechanics,Beta CPU architectural concepts were incorporated into the hardware design. We built a custom datapath that integrates a register file and ALU, which handles control logic such as step tracking, input evaluation, and timer updates. This approach allowed us to manage game state transitions efficiently using a finite state machine (FSM) and structured control signals.
        
        Visual output is handled via bicolored LEDs to represent the bridge and a seven-segment display for the timer. The bridge path is randomly generated on each reset, adding unpredictability and replayability.
        
        This project not only tested our hardware logic skills but also deepened our understanding of low-level CPU design by applying it in an interactive and creative way.`,
        w_languages: ['Lucid'],
        w_link: "https://github.com/zachyboiii/Squid-Game-Glass-Bridge-Arcade-Game",
        w_img: squidImg,
        youtube: "https://youtube.com/embed/gPTqtwLxEjk",
        category: "Others"
    },
    {
        id: "kebun-fresh",
        w_title: "KebunFresh",
        w_date: "Jan 25 - Jan 25",
        w_desc: "Hackathon: Designed a concept website using streamlit that aims to tackle social issues in Surabaya.",
        short_desc: "Connecting Indonesian locals with nearby local farmers.",
        long_desc: `Collaborated with students in Petra Christian University (PCU) in a hackathon to design a webapp that solves the problem statement: 
"How might we simplify the process for locals in Surabaya to locate and purchase fresh crops by connecting them with the best farms for them through a convenient and user-friendly app?"

In Gunung Anyar, Surabaya, my group and I found that many locals are unaware of the types of produce available in different farms due to their crop rotation. Thus, we designed a webapp concept KebunFresh to address this by providing knowledge on the different farms in their vicinity and what produce they offer. This not only benefits local consumers but also allows producers to increase their customer outreach and reduce their market blindness. Moreover, we implemented a machine learning model to help recommend products to users depending on their user activity.`,
        w_languages: ['Streamlit','Python','Pandas'],
        w_link: "https://github.com/zachyboiii/kebunfresh",
        w_img: kebunImg,
        youtube: null,
        category: "Full Stack Dev"
    },
    
    {
        id: "calculator-webapp",
        w_title: "Calculator Webapp",
        w_date: "Oct 24 - Nov 24",
        w_desc: "School Based Project: Designed a web app where users could create accounts, log in and send simple mathematical challenges to each other. Users were ranked based on time taken to complete challenges. ",
        short_desc:"Flask Webapp to create and play math quizzes.",
        long_desc:`School based project that implemented simple sorting algorithm design as well as OOP principles.The way that the app works is that users can create math questions which can be sent as a challenge to other users. So part of this application is that it allows you to create multiple users. You create your users in the page called "Users".

The next feature is that the appallows you to send a single math challenge to multiple users. You create your questions in the page called "Questions". One can select a user and try to attempt the challenge. 

The app will record the elapsed time from when you select a challenge to the time you click the submit button for the answer. This time duration will be recorded and sorted in the Hall of Fame page using merge sort.`,
        w_languages: ['Python','HTML','Flask'],
        w_link:"https://github.com/zachyboiii/calc_webapp",
        w_img: calcImg,
        youtube: "https://youtube.com/embed/snPY8A-fCgI",
        category: "Full Stack Dev"
    },
    {
        id: "mini-arcade",
        w_title: "Mini Arcade",
        w_date: "Nov 23 - Dec 23",
        w_desc: "School Based Project: Designed a terminal based mini arcade machine where users could choose from 4 different mini games to play. Made use of OOP to create games through turtle module",
        short_desc:"Terminal based mini arcade game.",
        long_desc:`This game is aimed at stressed SUTD students. The goal was to allow students to distress through a series of mini-games created using our newfound knowledge of Python to create a better world by design. We plan to have these games displayed in the area above the Indoor Sports Hall where the food vending machines are. Allowing students to relax when they crave some food after burning the midnight oil.

This arcade machine would contain 4 different mini-games. Snake, Space Shooter, Lumberjack and Air Hockey. When the Python file is run, the user can choose one out of these 4 games to be played.`,
        w_languages: ['Python', 'Turtle'],
        w_link:"https://github.com/zachyboiii/mini_arcade",
        w_img: arcadeImg,
        youtube: "https://youtube.com/embed/Kl2hQZQARsE",
        category: "Others"
    },
    {
        id: "tele-bot",
        w_title: "Telegram Bot",
        w_date: "Feb 23 - Mar 23",
        w_desc: "Personal Project: Designed a telegram bot to read event dates from an excel spreadsheet to remind users on any upcoming events. ",
        short_desc:"Tele bot to help schedule reminders.",
        long_desc:`This project is a Telegram bot that automates event reminders using data from an Excel spreadsheet. Built with Python and the Telegram Bot API, the bot reads event names, details, and dates using the Pandas library. Once deployed, it continuously checks for upcoming events and sends scheduled reminders directly to a Telegram chat. This tool is useful for personal organization, team coordination, or managing recurring activities. It demonstrates practical integration of data handling, scheduling logic, and real-time messaging via Telegram.`,
        w_languages: ['Python','Pandas'],
        w_link:"https://github.com/zachyboiii/tele_bot",
        w_img: teleImg,
        youtube: null,
        category: "SWE"
    },
]

export default work_data