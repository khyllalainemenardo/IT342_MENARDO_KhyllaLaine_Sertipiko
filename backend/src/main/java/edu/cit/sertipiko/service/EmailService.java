package edu.cit.sertipiko.service;

import edu.cit.sertipiko.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final AppProperties appProperties;
    private final RestClient restClient;

    public EmailService(AppProperties appProperties, RestClient.Builder restClientBuilder) {
        this.appProperties = appProperties;
        this.restClient = restClientBuilder.baseUrl("https://api.brevo.com/v3").build();
    }

    @Async
    public void sendPasswordReset(String toEmail, String toName, String resetLink, int expiryMinutes) {
        String subject = "Reset your Sertipiko password";
        String safeName = HtmlUtils.htmlEscape(toName);
        String html = """
                <p>Hi %s,</p>
                <p>We received a request to reset the password for your Sertipiko account.</p>
                <p><a href="%s">Reset my password</a></p>
                <p>This link expires in %d minutes and can only be used once.</p>
                <p>If you did not request this, you can ignore this email. Your password will not change.</p>
                """.formatted(safeName, resetLink, expiryMinutes);
        String text = """
                Hi %s,

                We received a request to reset the password for your Sertipiko account.
                Open this link to choose a new password:
                %s

                This link expires in %d minutes and can only be used once.
                If you did not request this, you can ignore this email.
                """.formatted(toName, resetLink, expiryMinutes);

        AppProperties.Mail mail = appProperties.mail();
        if (mail == null || !StringUtils.hasText(mail.brevoApiKey()) || !StringUtils.hasText(mail.fromEmail())) {
            log.warn("Brevo is not configured (BREVO_API_KEY / MAIL_FROM_EMAIL). Password reset link for {}: {}",
                    toEmail, resetLink);
            return;
        }

        Map<String, Object> body = Map.of(
                "sender", Map.of("name", StringUtils.hasText(mail.fromName()) ? mail.fromName() : "Sertipiko",
                        "email", mail.fromEmail()),
                "to", List.of(Map.of("email", toEmail, "name", toName)),
                "subject", subject,
                "htmlContent", html,
                "textContent", text
        );

        try {
            restClient.post()
                    .uri("/smtp/email")
                    .header("api-key", mail.brevoApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
        }
    }
}
