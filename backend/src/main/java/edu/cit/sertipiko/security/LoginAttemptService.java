package edu.cit.sertipiko.security;

import edu.cit.sertipiko.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCK = Duration.ofMinutes(15);

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    public void checkAllowed(String key) {
        Attempts a = attempts.get(key);
        if (a == null) {
            return;
        }
        Instant now = Instant.now();
        if (a.lockedUntil != null && now.isBefore(a.lockedUntil)) {
            long minutes = Math.max(1, Duration.between(now, a.lockedUntil).toMinutes() + 1);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many sign-in attempts. Please try again in " + minutes + " minute(s).");
        }
        if (a.lockedUntil != null || now.isAfter(a.windowStart.plus(WINDOW))) {
            attempts.remove(key);
        }
    }

    public void recordFailure(String key) {
        Instant now = Instant.now();
        attempts.compute(key, (k, a) -> {
            if (a == null || now.isAfter(a.windowStart.plus(WINDOW))) {
                a = new Attempts(now);
            }
            a.failures++;
            if (a.failures >= MAX_FAILURES) {
                a.lockedUntil = now.plus(LOCK);
            }
            return a;
        });
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    private static final class Attempts {
        private final Instant windowStart;
        private int failures;
        private Instant lockedUntil;

        private Attempts(Instant windowStart) {
            this.windowStart = windowStart;
        }
    }
}
