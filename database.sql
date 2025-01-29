CREATE TABLE IF NOT EXISTS tbl_users (
  user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,               
  name VARCHAR(100),          
  avatar TEXT,
  otp INT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),            
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_upi_address (
  upi_address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  upi_address VARCHAR(100) NOT NULL,              
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_group_types (
  group_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(100) ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_expense_types (
  expense_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_name VARCHAR(100) UNIQUE NOT NULL, 
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_groups (
  group_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_type_id INT NOT NULL REFERENCES tbl_group_types(group_type_id),
  admin_user INT NOT NULL REFERENCES tbl_users(user_id),
  code INT UNIQUE NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,           
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_group_members (
  member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL REFERENCES tbl_groups(group_id),
  user_id INT NOT NULL REFERENCES tbl_users(user_id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_expenses (
  expense_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL REFERENCES tbl_groups(group_id),
  expense_type_id INT NOT NULL REFERENCES tbl_expense_types(expense_type_id),
  expense_name VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by INT NOT NULL REFERENCES tbl_users(user_id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_expense_members (
  expense_member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  expense_id INT NOT NULL REFERENCES tbl_expenses(expense_id),
  user_id INT NOT NULL REFERENCES tbl_users(user_id),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0, 
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_group_pairs (
  pair_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id INT NOT NULL REFERENCES tbl_groups(group_id),
  sender_user INT NOT NULL REFERENCES tbl_users(user_id),
  receiver_user INT NOT NULL REFERENCES tbl_users(user_id),
  amount NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (group_id, sender_user, receiver_user) -- Unique constraint added here
);

CREATE TABLE IF NOT EXISTS tbl_expense_logs (
  log_id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES tbl_groups(group_id),
  expense_id INT NOT NULL,
  user_id INT NOT NULL REFERENCES tbl_users(user_id),
  action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('EDIT', 'DELETE')),
  old_amount DECIMAL(10,2),
  new_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





