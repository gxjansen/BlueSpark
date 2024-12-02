This app is a web app that generates conversation starters for new followers on BlueSky. The app is named "BlueSpark".

The goal of the app is to help new followers on BlueSky get to know each other better. The app will generate a conversation starter that welcomes the new user, and asks the follower a question where the user and follower interest overlap. The goal is to spark a conversation.

Some features:

* A user can login with their BlueSky username + application password
* The app downloads the profile and last 200 messages of the user
* The app downloads the last 20 (a configurable value) people that followed the user
* The app downloads the profile and last 50 (a configurable value) messages of each follower.
* Based on the profile of the user and the profile of the follower, the app generates a posts that welcomes the new user, and asks the follower a question where the user and follower interest overlap.
* Use the OpenRouter AI to analyze the profile + last messages of the user and each follower, and generate a message that welcomes the new user, and asks the follower a question where the user and follower interest overlap. The goal is to spark a conversation.
* For each user-follower combination, we should suggest a single message, but allow the user to regenerate the message if they don't like it
* If the user approves the message, there should be a button that allows them to directly post the message on BlueSky.
* Deploys to Netlify

Documentation:
* BlueSky API docs: https://docs.bsky.app/docs/get-started
* OpenRouter API docs: https://openrouter.ai/docs