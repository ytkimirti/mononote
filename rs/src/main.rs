use actix_web::web::Data;
use actix_web::{middleware, web, App, HttpResponse, HttpServer, Result};
use env_logger;
use log::info;
use sha1::{Digest, Sha1};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug)]
struct AppState {
    data_store: Mutex<HashMap<String, String>>,
}

trait DB {}

async fn get_data(
    data_hash: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    info!("GET {}", data_hash);
    let data_store = state.data_store.lock().unwrap();
    if let Some(data) = data_store.get(&data_hash.into_inner()) {
        Ok(HttpResponse::Ok().body(data.clone()))
    } else {
        Ok(HttpResponse::NotFound().finish())
    }
}

async fn store_data(data: web::Bytes, state: web::Data<AppState>) -> Result<HttpResponse> {
    let mut hasher = Sha1::new();
    hasher.update(&data);
    let hash_result = hasher.finalize();
    let hex_hash = format!("{:x}", hash_result);

    info!("PUT {}", hex_hash);

    let mut data_store = state.data_store.lock().unwrap();
    data_store.insert(hex_hash.clone(), String::from_utf8(data.to_vec()).unwrap());

    Ok(HttpResponse::Ok().finish())
}

async fn route() -> Result<HttpResponse> {
    Ok(HttpResponse::MethodNotAllowed().finish())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Init with debug level
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("debug"));

    let data = Data::new(AppState {
        data_store: Mutex::new(HashMap::new()),
    });
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            // Add cors header to every request
            .wrap(middleware::DefaultHeaders::new().add(("Access-Control-Allow-Origin", "*")))
            .app_data(data.clone())
            .route("/{data_hash}", web::get().to(get_data))
            .route("/", web::post().to(store_data))
            // All other routes
            .default_service(web::route().to(route))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}
