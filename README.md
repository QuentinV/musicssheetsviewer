# MusicsSheetsViewer

## Description

Basic starter app that combines
- `audiveris` OMR via a custom made rest api
- mongodb
- nodejs backend with rest api to manage music scores
- simple frontend to list, manage and upload pictures of musics sheets. Using `opensheetmusicdisplay` to render music scores.

Scan your favorite musics to play it everywhere. In a responsive design way.


## Setup

- Run `npm install` or `yarn install` in each subfolder `audiveris`, `backend`, `frontend`
- Create folder `.audiveris-inputs` and `data`
- Create `config.env.json` in `backend` folder
```
{
    "dbHost": "musicssheets-db",
    "audiverisHost": "http://musicssheets-service:8096"
}
```
- Run `docker compose up` in root folder