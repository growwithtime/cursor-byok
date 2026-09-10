//! Dispatches application-owned Exa WebSearch calls.

use crate::{
    cursor::tools::{
        runtime::{now_ms, PendingInteraction},
        tool_call_result::{self as result, ToolResultSender},
    },
    model::ToolCall,
    search::WebSearch,
    Error, Result,
};

use super::ToolStart;

pub(super) fn start(
    results: &ToolResultSender,
    search: &WebSearch,
    call: &ToolCall,
) -> Result<ToolStart> {
    execute(
        results.clone(),
        search.clone(),
        PendingInteraction {
            call: call.clone(),
            started_at_ms: now_ms(),
        },
        false,
    )?;
    Ok(ToolStart {
        messages: Vec::new(),
        completion: None,
    })
}

pub(super) fn execute(
    results: ToolResultSender,
    search: WebSearch,
    pending: PendingInteraction,
    confirmation_granted: bool,
) -> Result<()> {
    let query = ["search_term", "query"]
        .iter()
        .find_map(|name| {
            pending
                .call
                .arguments
                .get(name)
                .and_then(serde_json::Value::as_str)
                .filter(|value| !value.trim().is_empty())
        })
        .ok_or_else(|| Error::Protocol("WebSearch is missing search_term".into()))?
        .to_string();
    tokio::spawn(async move {
        let outcome = search
            .search(&query, confirmation_granted)
            .await
            .map_err(|error| error.to_string());
        match result::complete_web_search(pending, outcome) {
            Ok(completion) => results.send(completion),
            Err(error) => results.send_error(error),
        }
    });
    Ok(())
}
