# Mononote - [Website](https://ytkimirti.github.io/mononote#bd568d179a6c87e85706)

A zero trust note application that can't get any simpler.

A note has a `noteid`, which is purely calculated from it's contents.
Notes can reference other notes by their `noteid`'s.

- Server is ~50 lines
- Client is a single html file ~400 lines

The protocol is designed so that users do not have to trust the server, only the client.

> Which servers to use can be changed from the client.

## How no-trust works

Note id has two parts.

```
#bd568d179a6c87e85706
 |--------||--------|
   first     second
```

First part is the hash of the `encrypted data`.

Second part is hash of `data`, which is used as a key to decrypt the `encrypted data`

When requesting server to store a new note, only `encrpyted data` is sent.
When requesting a note from a server, only hash of `encrypted data` (first part of `noteid`) is sent.

When `encrypted data` is returned to client, it decrypts it using the key (second part of `noteid`, aka. hash of `data`)

So the communication and storage of the notes are encrypted.

A note id is enough to acceess a note since it knows how to access the note and how to decrypt it.

## The hashing function

Hash function is a SHA-1 function with the first 10 characters of it's lowercase hex output.

**Example**

```
hash("hello")   -> aaf4c61ddc
hash("")        -> da39a3ee5e
```

## Server Implementation

A server must implement the following endpoints

Only required header for requests is
`Access-Control-Allow-Origin: *`
since this lets the node to be used from other origins.
Don't set any content-type or other headers.

### `GET /<data_hash>`

If data is found with key data_hash, returns it in the body with
status code 200

If not found, returns 404 with empty body
Make sure to sanitize the input to only contain lowercase hex characters.

### `POST /`

The request body contains plaintext data.
Server must hash this data and use it as the key.
If key doesn't exist, it stores data with key.
Returns 200 with no body on succes,
500 on error with no body
