# Side Chatter Service

## Architecture

* Nodejs(Typescript)
* Database MongoDB
* Dockerized

### Prerequisite

You must have the following installed in your local machine

* Docker CE, at least version 19.03.5
* Docker Compose, at least version 1.25.2
* Nodejs v8.12.0
* Docker images: **mongo:latest**, **node:latest**

### Expecting from you

* Advance knowlegde on the following: Docker, Docker Compose and Nodejs
* Basic understanding of the following: bash scripting, postman and jest
* Familiar with issues of Docker in your current machine/environment, and how to resolve it

## API Endpoints

### POST /orgs/:org-name/comments - create comments

*Example:*
```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"comment":""Looking to hire SE Asia's top dev talent!"}' \
  http://localhost:3000/api/orgs/xendit/comments
```

### GET /orgs/:org-name/comments - return array of all the comments

```bash
curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:3000/api/orgs/xendit/comments
```

### DELETE /orgs/:org-name/comments - soft delete all comments

```bash
curl --header "Content-Type: application/json" \
  --request DELETE \
  http://localhost:3000/api/orgs/xendit/comments
```

### GET /orgs/:org-name/members/ - array of members of an organization

```bash
curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:3000/api/orgs/xendit/members
```

## Running the application

### Production

Build the docker image for production by running `npm run clean && npm run prodbuild`. After the build, you can now push it to your image repo like AWS ECR or any docker image repositories you have.

AWS ECR/ECS Example:
```bash
$ aws ecr get-login --no-include-email --region us-west-2
$ docker tag $IMAGE_NAME:latest <ecr_url>/$IMAGE_NAME:latest
$ docker push <ecr_url>/$IMAGE_NAME:latest
$ aws ecs update-service --service <ecr_url>/$PROD_APP --force-new-deployment --cluster $PROD_APP --region ap-southeast-1
```

Make sure to set required environment variables as only the `NODE_ENV=test` is sourcing its environment through file.

#### Checking production image

You can check the production image by running `npm run prodcheck`. Basically the script will just create db instance, same as what used in testing, and create a temporary container from the production image using the environment variables found in `./envs/test.env`. The confirmation of image if it is working or not if the created container will respond on tcp calls.

### Local Development

Since we are dockerizing our development, below is our workflow.

* To start the development, just run `npm run devstart`
* To stop the development, just run `npm run devstop`
* To install new package, just run `./scripts/dc exec web npm install <package_name>`

You can update `./docker/docker-compose.yml` to compliment your workflow.

If you messed up or something is not working, just try resetting your containers by rebuilding it again. If you do not know how, follow these steps:

* Stop containers `db` and `web` by running `./scripts/dc down`; then
* Remove them by running `./scripts/dc rm`; then
* Run `npm run devstart`

#### Browsing the app

You can browse it at `http://localhost`. See `./docker/docker-compose.yml` for more details.

### Required Environment Variables

**Environment File Template**

```yaml
# Environment Variables

# App Specific
APP_PORT=4000
MONGODB_URI=mongodb://root:pass123@127.0.0.1:27000/sidechatter?authSource=admin
SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx --> sha256 string
GITHUB_PAT=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx --> Generate your own personal access token from your github account

# DB Specific
MONGO_USERNAME=root
MONGO_PASSWORD=pass123
```

### Verbose Logging

We are using winston logger and daily rotate file. To help you debug more on development you can see the logs coming from `docker-compose log` by running `./scripts/dc log -f`.

## Running test

### Unit Tests

Test runs db query and we need to have a mongodb instance. Follow the steps below on how to run test:

* Make sure to have `./envs/test.env` prepared, see template for env above. Make sure `NODE_ENV` is set to `test`

* Run one run test, by

```bash
$ npm install && npm run test
```

* Or, if on TDD, by

```bash
$ npm install && npm run tdd
```


`npm run test`, by sequence, will run the following:

* Sourcing `./scripts/testdb.up.sh` - to create the test db instance
* Sourcing `./scripts/wait-for` - to make sure `npm test` will run only if the test db instance is already up
* `npm test` - will run `jest`
* Sourcing `./scripts/testdb.down.sh` - to stop and remove the test db instance

#### Code Coverage with Jest

We got 92% code coverage. Yahoo!

![Code Coverage](./test/images/code-coverage.png "Code Coverage using Jest")

### E2E using Postman

You can import the postman collection file `./scs.postman_collection.json` and environment file `./scs.postman_environment.json` to integrate it with postman for e2e testing. You can try running it against your local development and automate it using collection runner from postman.

See this [link](https://blog.postman.com/2014/03/07/writing-automated-tests-for-apis-using-postman/) to learn more.

Running e2e using collection runner in postman

![e2e](./test/images/e2e-postman.gif "Postman Collection Runner")

### TODOS

* Use local development workflow to execute test
* Non-dockerized approach workflow
* Authorization using JWT
* Clean `./scripts/*.sh` files


### Attention

* `./envs/production.env` file isn't included to `.gitignore` forsake of easy verification and since all of the envs are using same environment variables' values
