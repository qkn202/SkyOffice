# Đại sảnh mini games

The SkyOffice game portal launches the existing Seven Potters and Undercover Hogwarts apps in an in-app frame. It passes `skyofficePlayer`, `skyofficeName`, `skyofficeHouse`, and an optional `room` query parameter. Both source apps already read these parameters.

## Local development

Run each app in its own terminal while SkyOffice is running:

- Seven Potters at `http://localhost:3000` (`npm run dev` in `/Users/khang/7-potters`).
- Undercover Hogwarts at `http://localhost:5175` (`npm run dev -- --port 5175` in `/Users/khang/hsx-paper-bot/undercover-hogwarts`).

## Deployment

Set these variables in the SkyOffice client build environment to the deployed game origins:

- `VITE_SEVEN_POTTERS_URL`
- `VITE_UNDERCOVER_URL`

For a shared multiplayer match, one player creates a room in the selected game and shares its code in SkyOffice chat. They open the portal, enter that code, and invite the SkyOffice room. Players mark themselves ready; the inviter can start once at least two players are ready. Starting opens the selected game for everyone with the shared room code. Invites are rate-limited by the SkyOffice server.
