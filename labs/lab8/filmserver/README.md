# Films api
API that permits interaction with the films database.

## APIs

### **List all films**

URL: `/api/films`

Method: GET

Description: Get all the films

Request body: *none*

Response: `200 OK` (success) or `500 Internal Server Error` (failure)

Response body: An array of film objects in JSON format

```json
[
  {
    "id": 1,
    "title": "Pulp Fiction",
    "favorite": true,
    "watchDate": "2023-04-09T22:00:00.000Z",
    "score": 5
  },
  ...
]
```

### **Get a film by id**

URL: `/api/films/<id>`

Method: GET

Description: Get the film with the specified id

Request body: *none*

Response: `200 OK` (success) or `404 Not found` (id doesn't exist)

Response body: a single film object

```json
{
    "id": 1,
    "title": "Pulp Fiction",
    "favorite": true,
    "watchDate": "2023-04-09T22:00:00.000Z",
    "score": 5
}
```

### **Filter films**

URL: `/api/films/filter/<filter>`

Method: GET

Description: Get the films that match the specified filter, there is a list of valid filters:
- `all`: get all the films
- `favorite`: get all the favorite films
- `best-rated`: get all the watched films
- `seen-last-month`: get all the films seen in the last month
- `unseen`: get all the films that have not been seen yet

Request body: *none*

Response: `200 OK` (success) or `404 Not found` (filter doesn't exist)

Response body: an array of film objects

```json
[
  {
    "id": 1,
    "title": "Pulp Fiction",
    "favorite": true,
    "watchDate": "2023-04-09T22:00:00.000Z",
    "score": 5
  },
  ...
]
```

### **Add a film**

URL: `/api/films`

Method: POST

Description: Add a film to the database

Request body: a film object in JSON format (Content-Type: application/json)

```json
{
    "title": "Pulp Fiction",
    "favorite": true,
    "watchDate": "2023-04-09",
    "score": 5
}
```

Response: `201 Created` (success) or `422 Unprocessable entity` (invalid request body) or `503 Service Unavailable` (failure)

Response body: the id of the film that has been added

```json
{
    "id": 1
}
```

### **Update a film**

URL: `/api/films/<id>`

Method: PUT

Description: Update entirely an existing film by id

Request body: a film object in JSON format (Content-Type: application/json)

```json
{
    "title": "Pulp Fiction",
    "favorite": true,
    "watchDate": "2023-04-09",
    "score": 5
}
```

Response: `201 Created` (success) or `422 Unprocessable entity` (invalid request body) or `503 Service Unavailable` (failure)

Response body: the id of the film that has been modified

```json
{
    "id": 1
}
```

### **Update a film's rating**

URL: `/api/films/<id>/rate`

Method: PUT

Description: Update a film's rating by id

Request body: a json object with a `score` key.

```json
{
    "score": 5
}
```

Response: `201 Created` (success) or `422 Unprocessable entity` (invalid request body) or `503 Service Unavailable` (failure) or `404 Not found` (id doesn't exist)

Response body: the id of the film that has been modified

```json
{
    "id": 1
}
```

### **Update a film's favorite status**

URL: `/api/films/<id>/favorite`

Method: PUT

Description: Update a film's rating by id

Request body: a json object with an `is` boolean key.

```json
{
    "is": true
}
```

Response: `201 Created` (success) or `422 Unprocessable entity` (invalid request body) or `503 Service Unavailable` (failure) or `404 Not found` (id doesn't exist)

Response body: the id of the film that has been modified

```json
{
    "id": 1
}
```

### **Delete a film**
URL: `/api/films/<id>`

Method: DELETE

Description: Delete a film by id

Request body: *none*

Response: `204 No content` (success) or `503 Service Unavailable` (failure) or `404 Not found` (id doesn't exist)

Response body: the id of the film that has been deleted

```json
{
    "id": 1
}
```