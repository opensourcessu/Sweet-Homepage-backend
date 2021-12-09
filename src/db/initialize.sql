CREATE TABLE sw_users (
    user_id SERIAL PRIMARY KEY,
    login_id CHARACTER VARYING UNIQUE NOT NULL,
    name CHARACTER VARYING NOT NULL,
    password CHARACTER VARYING NOT NULL,
    bg_color CHARACTER VARYING NOT NULL DEFAULT '',
    font CHARACTER VARYING NOT NULL DEFAULT '',
    create_dt TIMESTAMP NOT NULL ,
    update_dt TIMESTAMP NOT NULL,
    delete_dt TIMESTAMP
);

CREATE TABLE todo_lists (
    ticket_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES sw_users (user_id) NOT NULL,
    subject CHARACTER VARYING NOT NULL,
    content TEXT NOT NULL,
    deadline TIMESTAMP NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    create_dt TIMESTAMP NOT NULL,
    update_dt TIMESTAMP NOT NULL,
    delete_dt TIMESTAMP
);

CREATE TABLE widget_types (
    widget_type_id INTEGER PRIMARY KEY,
    description CHARACTER VARYING NOT NULL
);

CREATE TABLE widgets (
    widget_id SERIAL PRIMARY KEY,
    widget_type_id INTEGER REFERENCES widget_types (widget_type_id) NOT NULL,
    user_id INTEGER REFERENCES sw_users (user_id) NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_y INTEGER NOT NULL,
    size_x INTEGER NOT NULL,
    size_y INTEGER NOT NULL,
    raw_data TEXT
);

INSERT INTO widget_types (widget_type_id, description)
VALUES
    (1, 'search'),
    (2, 'todo'),
    (3, 'weather'),
    (4, 'calender'),
    (5, 'email'),
    (6, 'image'),
    (7, 'postit');