package edu.cit.sertipiko.dto;

public final class PasswordRules {

    public static final int MIN = 8;
    public static final int MAX = 72;
    public static final String SIZE_MESSAGE = "Password must be 8-72 characters.";
    public static final String PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$";
    public static final String PATTERN_MESSAGE =
            "Password must contain an uppercase letter, a lowercase letter, and a number.";

    private PasswordRules() {
    }
}
