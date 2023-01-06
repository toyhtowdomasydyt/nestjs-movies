## Description

Nest app for saving movies info

## Setup local dev environmet

### Installation dependecies

```bash
$ npm install
```

### Running the app locally

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Build and run docker image

```bash
# build
$ docker build -t nest-movies .

# run
$ docker run -p 3000:3000 -e HTTP_PORT=3000 -e JWT_SECRET=secret -e JWT_EXPIRES_IN=60s nest-movies
```

### Run docker image from DockerHub

Pull and run image from https://hub.docker.com/repository/docker/toyhtowdomasydyt/nest-movies

```bash
# run
$ docker run -p 3000:3000 -e HTTP_PORT=3000 -e JWT_SECRET=secret -e JWT_EXPIRES_IN=60s nest-movies
```

### Environmet variables

`HTTP_PORT`

This used for providing http port for Nest.js server

`JWT_SECRET`

This used for specifying JWT token secret with which token will be signed

`JWT_EXPIRES_IN`

This used for specifying time to JWT token expire

## License

Nest is [MIT licensed](LICENSE).
