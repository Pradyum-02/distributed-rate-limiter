local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local windowStart = now - window

-- Remove requests that are outside the sliding window
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, windowStart)

local count = redis.call("ZCARD", KEYS[1])

if count >= limit then
    -- Find the oldest request currently inside the window
    local oldest = redis.call(
        "ZRANGE",
        KEYS[1],
        0,
        0,
        "WITHSCORES"
    )

    local retryAfter = 0
    local resetAt = now

    if #oldest > 0 then
        local oldestTimestamp = tonumber(oldest[2])

        resetAt = oldestTimestamp + window
        retryAfter = math.max(0, resetAt - now)
    end

    return {
        0,
        count,
        retryAfter,
        resetAt
    }
end

local requestId =
    ARGV[1] .. "-" .. redis.call("INCR", KEYS[2])

redis.call(
    "ZADD",
    KEYS[1],
    now,
    requestId
)

redis.call(
    "EXPIRE",
    KEYS[1],
    window
)

local resetAt = now + window

return {
    1,
    count + 1,
    0,
    resetAt
}