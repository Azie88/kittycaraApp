# kittyCara AI
Kittycara AI is a mobile app designed to assist adolescent girls and their caretakers in diagnosing potential menstrual disorders based on symptoms they provide. The app utilizes OpenAI API and features a friendly pet cat interface to make the experience approachable and user-friendly. This project is developed as part of the **AFROTECHTM Hackathon**, where the goal is to address healthcare challenges faced by adolescent girls in Sub-Saharan Africa.

Features
.**AI-Powered Symptom Diagnosis**: Kittycara AI leverages the OpenAI API to assess menstrual patterns and symptoms, offering insights into potential disorders.
.**User-Friendly Pet Interface**: The app is designed as a pet cat to create a warm and engaging experience for adolescent users.
. **Focus on Sub-Saharan Africa**: Tackles the challenges related to cultural stigma, embarrassment, and lack of education around menstruation and gynecological care.

### Screenshot

<div style="display: flex; align-items: center;">
    <div style="flex: 33.33%; text-align: center;">
        <p>Screenshots home</p>
        <img src="assets/images/10.jpeg" alt="Top" width="40%"/>
        <img src="assets/images/11.jpeg" alt="Top" width="40%"/>
    </div>
    <div style="flex: 33.33%; text-align: center;">
        <p>Sign up</p>
        <img src="assets/images/2.jpeg" alt="Top" width="40%"/>
        <img src="assets/images/4.jpeg" alt="Middle" width="40%"/>
        </div>
    <div style="flex: 33.33%; text-align: center;">
        <p>Log in and Welcome</p>
        <img src="assets/images/51.jpeg" alt="Middle" width="40%"/>
        <img src="assets/images/5.jpeg" alt="Middle" width="40%"/>
        </div>
</div>

# How to Use This Repository:

- Clone this repository to your local machine.
- npm install.
- npx expo start

Explore code examples for an in-depth understanding of each development phase.

## Prerequisites:
## Getting Started

To run this project, you need to have the following installed:

Node.js
npm or yarn
Expo CLI
A configured Supabase project (see SUPABASE_SETUP.md)
Basic knowledge of JavaScript and React Native.
The AI service is hosted separately; its backend source is not included.
Contributions:
Contributions are encouraged! Whether it's bug fixes, new features, or improvements, feel free to open a pull request.

- Clone :

        https://github.com/bambadij/kittycaraApp.git
        
        cd kittycaraApp
- Create .env :

        # Copy .env.example and fill in Supabase values; see SUPABASE_SETUP.md


- start : 

        npm install or yarn
        npx expo start

Using the App
Once the app is running, users can interact with Kittycara, the virtual pet cat, by entering symptoms related to their menstrual cycle. Based on the input, the AI will provide diagnostic insights and suggestions for potential disorders.

Contributing
If you wish to contribute, please submit a pull request or create an issue to discuss the changes you'd like to make.


## Backend and validation

The app now uses Supabase Auth and Postgres for accounts, sessions, and onboarding profiles. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create a project, run the database setup, and configure `.env`. Only email/password signup is enabled in this migration. Existing account data is not imported.

AI symptom analysis still uses the separately hosted Hugging Face `/analyze` service. No OpenAI API key is needed in the mobile client. Chat history is currently kept only in memory.

Run `npm test` for onboarding, auth, profile, and database isolation checks. Run `npx expo export --platform android` to verify the mobile bundle. Hosted Supabase and device checks require your own configured project.
