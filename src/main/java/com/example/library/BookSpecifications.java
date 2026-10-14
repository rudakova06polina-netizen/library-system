package com.example.library;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class BookSpecifications {

    private BookSpecifications() {
    }

    public static Specification<Book> withFilters(Long id,
                                                  String title,
                                                  String publisher,
                                                  String student,
                                                  LocalDate from,
                                                  LocalDate to,
                                                  Boolean returned) {
        return (root, query, cb) -> {
            List<Predicate> list = new ArrayList<>();

            if (id != null) {
                list.add(cb.equal(root.get("id"), id));
            }
            if (hasText(title)) {
                list.add(like(cb, root.<String>get("title"), title));
            }
            if (hasText(publisher)) {
                list.add(like(cb, root.<String>get("издатель"), publisher));
            }
            if (hasText(student)) {
                list.add(like(cb, root.<String>get("studentName"), student));
            }
            if (from != null) {
                list.add(cb.greaterThanOrEqualTo(root.<LocalDate>get("issueDate"), from));
            }
            if (to != null) {
                list.add(cb.lessThanOrEqualTo(root.<LocalDate>get("issueDate"), to));
            }
            if (returned != null) {
                list.add(returned
                        ? cb.isNotNull(root.get("returnDate"))
                        : cb.isNull(root.get("returnDate")));
            }
            return cb.and(list.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static Predicate like(CriteriaBuilder cb, Path<String> path, String value) {
        return cb.like(cb.lower(path), "%" + value.trim().toLowerCase(Locale.ROOT) + "%");
    }
}
