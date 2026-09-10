//! Exposes provider-independent search capabilities.
mod cache;
mod exa;
mod fetch;
mod search_provider;

pub use cache::{WebCache, WebCacheEntry};
pub use exa::{SearchError, SearchHit, WebSearch};
pub use fetch::{FetchError, FetchedPage, WebFetch};
pub(crate) use search_provider::execute as execute_semble;
