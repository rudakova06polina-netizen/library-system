# Информационная система «Библиотека»

Java 17 + Spring Boot 3 (Spring Data JPA / Hibernate) + MySQL + HTML/CSS/JavaScript.

## Вариант задания: Н–Т (фамилия на «Р»)
| Параметр | Значение | Где в коде |
|---|---|---|
| Поле издателя | `издатель` (кириллица) | `Book.издатель`, `getИздатель()` |
| Сортировка | по двум полям: дата выдачи + название | `BookController.list` → `Sort.by(direction, "issueDate", "title")` |
| Период гистограммы | 30 дней | `BookController.histogram` (`days=30`), `app.js` |

## Функционал
- добавление, редактирование, удаление книги (форма + REST API);
- поиск по ID, названию, издателю, студенту, статусу «сдана / не сдана» (`BookSpecifications`);
- отдельный фильтр по дате выдачи (с / по) и порядок сортировки (Java);
- гистограмма количества выдач по дням за 30 дней (данные — Java, отрисовка — JavaScript, `<canvas>`);
- счётчик книг в таблице (JavaScript, считает строки таблицы).

## Запуск (MySQL)
1. Установите и запустите MySQL 8.
2. В `src/main/resources/application.properties` укажите свой логин и пароль (`spring.datasource.username/password`). База `library` создастся автоматически.
3. Откройте папку проекта в IntelliJ IDEA (File → Open → `pom.xml` → Open as Project), дождитесь загрузки Maven.
4. Запустите `LibraryApplication.main()`.
5. Откройте http://localhost:8080

При первом запуске таблица заполняется тестовыми данными (`DataSeeder`).

## Запуск без MySQL (запасной вариант)
Профиль `h2` — база в памяти (данные пропадают при остановке):
- IntelliJ: Run → Edit Configurations → у `LibraryApplication` в поле **Active profiles** впишите `h2`;
- или из консоли: `mvn spring-boot:run -Dspring-boot.run.profiles=h2`.

## REST API
| Метод | URL | Назначение |
|---|---|---|
| GET | `/api/books?id=&title=&publisher=&student=&from=&to=&returned=&order=asc|desc` | поиск, фильтр, сортировка |
| GET | `/api/books/{id}` | одна книга |
| POST | `/api/books` | добавить |
| PUT | `/api/books/{id}` | изменить |
| DELETE | `/api/books/{id}` | удалить |
| GET | `/api/books/histogram?days=30` | данные гистограммы |

## Структура
- `Book` — сущность (ORM), `BookRepository` — доступ к БД
- `BookSpecifications` — динамический поиск
- `BookController` — REST API
- `DayCount` — столбец гистограммы, `DataSeeder` — тестовые данные
- `static/` — веб-интерфейс (`index.html`, `style.css`, `app.js`)
