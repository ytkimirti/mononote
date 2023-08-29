# RFC: Hashed Data Storage and Retrieval API

## Status of This Memo

This document specifies an API for the storage and retrieval of hashed data using a SHA-1 hashing function. This document is a proposal for a standard and does not represent the views of any organization.

## Abstract

This RFC outlines a standardized API for storing and retrieving data using a SHA-1 hashing function with lowercase hex output. The API defines two endpoints, `GET /<data_hash>` for retrieving data and `POST /` for storing data.

## Table of Contents

1. Introduction
2. Requirements
3. API Endpoints
   1. `GET /<data_hash>`
   2. `POST /`
4. Security Considerations
5. References

## 1. Introduction

Hash functions are essential tools in data storage and retrieval systems. This RFC describes an API for a server node that allows clients to store and retrieve data using SHA-1 hashing with lowercase hex output. The API is designed to be simple and robust, allowing data to be stored and retrieved securely.

## 2. Requirements

The server node implementing this API must adhere to the following requirements:

- **Access Control:** All endpoints must include the header `Access-Control-Allow-Origin: *` to enable usage from different origins.

- **Request Headers:** Only the `Access-Control-Allow-Origin` header is required for requests. No other headers such as content-type should be set.

## 3. API Endpoints

### 3.1. `GET /<data_hash>`

This endpoint allows clients to retrieve data by specifying the `data_hash` as part of the URL. The server must sanitize the input to ensure it only contains lowercase hex characters.

- **Request:**

  - Method: GET
  - URL: `/<data_hash>`

- **Response:**
  - Status Code 200: If data is found with the key `data_hash`, the server must return it in the response body.
  - Status Code 404: If no data is found, the server must return a 404 status code with an empty body.

### 3.2. `POST /`

This endpoint allows clients to store data by sending plaintext data in the request body. The server must hash this data using SHA-1 and use the resulting hash as the key for storage.

- **Request:**

  - Method: POST
  - URL: `/`
  - Request Body: Plaintext data

- **Response:**
  - Status Code 200: If the data is successfully stored, the server must return a 200 status code with no response body.
  - Status Code 500: If an error occurs during the storage process, the server must return a 500 status code with no response body.

## 4. Security Considerations

- Data Sanitization: The server must perform input validation and sanitization to ensure that the `data_hash` parameter in the `GET` request only contains valid lowercase hex characters. This is crucial to prevent potential security vulnerabilities.

- Data Integrity: The server must ensure data integrity by properly hashing and storing data. Implementing robust error handling is essential to maintain data consistency.

- Access Control: The use of the `Access-Control-Allow-Origin` header should be carefully considered to prevent unauthorized access to the API.

## 5. References

- [SHA-1 Cryptographic Hash Function](https://en.wikipedia.org/wiki/SHA-1)
- [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Acknowledgments

This RFC is inspired by the need for a simple and secure data storage and retrieval API and benefits from the contributions of the developer community.
