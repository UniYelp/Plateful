local key = KEYS[1]
local limit = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current = redis.call("GET", key)

if not current then
    redis.call("SET", key, 1, "PX", windowMs)
    return {1, limit - 1, now + windowMs}
end

current = tonumber(current)

if current >= limit then
    local ttl = redis.call("PTTL", key)
    return {0, 0, now + ttl}
end

current = redis.call("INCR", key)
local ttl = redis.call("PTTL", key)

return {1, limit - current, now + ttl}
