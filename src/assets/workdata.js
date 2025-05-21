import vroomImg from './vroom.png'
import squidImg from './squid_game.png'
import arcadeImg from './mini_arcade.png'
import kebunImg from './kebunfresh.png' 
import calcImg from './calc.png'
import teleImg from './telebot.png'

const work_data = [
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
        youtube: "https://youtube.com/embed/fScXZ4dp-mY"
        
    },
    {
        id: "squid-game",
        w_title: "Squid Game: Glass Bridge",
        w_date: "Jan 25 - Apr 25",
        w_desc: "School Based Project: Arcade-style game inspired by Squid Game’s glass bridge challenge, implemented on an FPGA board using Lucid HDL.",
        short_desc:"Squid Game's Glass Bridge game implemented on an FPGA, arcade style.",
        long_desc:`Beyond game mechanics,Beta CPU architectural concepts were incorporated into the hardware design. We built a custom datapath that integrates a register file and ALU, which handles control logic such as step tracking, input evaluation, and timer updates. This approach allowed us to manage game state transitions efficiently using a finite state machine (FSM) and structured control signals.
        
        Visual output is handled via bicolored LEDs to represent the bridge and a seven-segment display for the timer. The bridge path is randomly generated on each reset, adding unpredictability and replayability.
        
        This project not only tested our hardware logic skills but also deepened our understanding of low-level CPU design by applying it in an interactive and creative way.`,
        w_languages: ['Lucid'],
        w_link: "https://github.com/zachyboiii/Squid-Game-Glass-Bridge-Arcade-Game",
        w_img: squidImg,
        youtube: "https://youtube.com/embed/gPTqtwLxEjk"
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
        youtube: null
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
        youtube: "https://youtube.com/embed/snPY8A-fCgI"
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
        youtube: "https://youtube.com/embed/Kl2hQZQARsE"
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
        youtube: null
    },
]

export default work_data