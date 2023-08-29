#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <openssl/sha.h>
#include <errno.h>

#define PORT 3001
#define FOLDER "./db"

void end(int code, const char *body, int client_socket)
{
    char response[1024];
    snprintf(response, sizeof(response), "HTTP/1.1 %d OK\r\n"
                                         "Access-Control-Allow-Origin: *\r\n"
                                         "Content-Length: %zu\r\n\r\n%s",
             code, strlen(body), body);
    send(client_socket, response, strlen(response), 0);
}

void handle_post(int client_socket, const char *request_body)
{
    SHA_CTX sha_context;
    SHA1_Init(&sha_context);
    SHA1_Update(&sha_context, request_body, strlen(request_body));

    unsigned char hash[SHA_DIGEST_LENGTH];
    SHA1_Final(hash, &sha_context);

    char hash_string[2 * SHA_DIGEST_LENGTH + 1];
    for (int i = 0; i < SHA_DIGEST_LENGTH; i++)
    {
        sprintf(&hash_string[i * 2], "%02x", hash[i]);
    }

    char file_path[1024];
    snprintf(file_path, sizeof(file_path), "%s/%s.txt", FOLDER, hash_string);

    printf("POST %s\n", file_path);

    int file_descriptor = open(file_path, O_WRONLY | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
    if (file_descriptor == -1)
    {
        end(500, "Internal Server Error", client_socket);
        return;
    }

    ssize_t bytes_written = write(file_descriptor, request_body, strlen(request_body));
    close(file_descriptor);

    if (bytes_written == -1)
    {
        end(500, "Internal Server Error", client_socket);
        return;
    }

    end(200, "OK", client_socket);
}

void handle_get(int client_socket, const char *hash_value)
{
    char file_path[1024];
    snprintf(file_path, sizeof(file_path), "%s/%s.txt", FOLDER, hash_value);

    printf("GET %s\n", file_path);

    int file_descriptor = open(file_path, O_RDONLY);
    if (file_descriptor == -1)
    {
        end(404, "Not Found", client_socket);
        return;
    }

    char buffer[4096];
    ssize_t bytes_read;

    while ((bytes_read = read(file_descriptor, buffer, sizeof(buffer))) > 0)
    {
        send(client_socket, buffer, bytes_read, 0);
    }

    close(file_descriptor);
}

int main()
{
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_size;

    if (mkdir(FOLDER, S_IRWXU) != 0 && errno != EEXIST)
    {
        perror("Failed to create the folder");
        return 1;
    }

    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0)
    {
        perror("Error in socket");
        exit(1);
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("Error in binding");
        exit(1);
    }

    if (listen(server_socket, 10) == 0)
    {
        printf("Listening...\n");
    }
    else
    {
        perror("Error in listening");
        exit(1);
    }

    addr_size = sizeof(client_addr);

    while (1)
    {
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &addr_size);

        if (fork() == 0)
        {
            close(server_socket);

            char request_buffer[4096];
            memset(request_buffer, 0, sizeof(request_buffer));
            ssize_t bytes_received = recv(client_socket, request_buffer, sizeof(request_buffer), 0);

            if (bytes_received > 0)
            {
                if (strstr(request_buffer, "POST /") != NULL)
                {
                    char *request_body = strstr(request_buffer, "\r\n\r\n") + 4;
                    handle_post(client_socket, request_body);
                }
                else if (strstr(request_buffer, "GET /") != NULL)
                {
                    char *hash_start = strstr(request_buffer, "GET /") + 5;
                    char *hash_end = strstr(hash_start, " ");
                    if (hash_end != NULL)
                    {
                        *hash_end = '\0';
                        handle_get(client_socket, hash_start);
                    }
                    else
                    {
                        end(400, "Bad Request", client_socket);
                    }
                }
                else
                {
                    end(405, "Method Not Allowed", client_socket);
                }
            }
            else
            {
                end(400, "Bad Request", client_socket);
            }

            close(client_socket);
            exit(0);
        }

        close(client_socket);
    }

    return 0;
}
