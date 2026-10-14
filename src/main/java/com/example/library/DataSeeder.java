package com.example.library;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BookRepository repo;

    public DataSeeder(BookRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) {
            return;
        }
        LocalDate today = LocalDate.now();
        repo.saveAll(List.of(
                book("Война и мир", "Эксмо", today.minusDays(28), "Иванов Пётр Сергеевич", today.minusDays(14)),
                book("Преступление и наказание", "АСТ", today.minusDays(28), "Петрова Анна Ивановна", today.minusDays(10)),
                book("Мастер и Маргарита", "Азбука", today.minusDays(21), "Сидоров Олег Андреевич", today.minusDays(7)),
                book("Евгений Онегин", "Эксмо", today.minusDays(15), "Кузнецова Мария Павловна", null),
                book("Идиот", "АСТ", today.minusDays(15), "Смирнов Илья Дмитриевич", null),
                book("Анна Каренина", "Азбука", today.minusDays(9), "Попова Елена Олеговна", today.minusDays(2)),
                book("Отцы и дети", "Махаон", today.minusDays(5), "Волков Артём Игоревич", null),
                book("Герой нашего времени", "Махаон", today.minusDays(2), "Соколова Дарья Сергеевна", null),
                book("Двенадцать стульев", "Эксмо", today, "Лебедев Максим Антонович", null),
                book("Тихий Дон", "АСТ", today, "Новикова Ольга Викторовна", null)
        ));
    }

    private static Book book(String title, String publisher, LocalDate issue,
                             String student, LocalDate ret) {
        Book b = new Book();
        b.setTitle(title);
        b.setИздатель(publisher);
        b.setIssueDate(issue);
        b.setStudentName(student);
        b.setReturnDate(ret);
        return b;
    }
}
