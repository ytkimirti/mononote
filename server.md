A hashing function is a SHA-1 function with lowercase hex output.

A server node must implement the following endpoints

Only required header for requests is
`Access-Control-Allow-Origin: *`
since this lets the node to be used from other origins.
Don't set any content-type or other headers.

# `GET /<data_hash>`

If data is found with key data_hash, returns it in the body with
status code 200

If not found, returns 404 with empty body
Make sure to sanitize the input to only contain lowercase hex characters.

# `POST /`

The request body contains plaintext data.
Server must hash this data and use it as the key.
If key doesn't exist, it stores data with key.
Returns 200 with no body on succes,
500 on error with no body
