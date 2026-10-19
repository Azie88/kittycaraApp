const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

const userA = '00000000-0000-0000-0000-000000000001';
const userB = '00000000-0000-0000-0000-000000000002';

test('profile SQL enforces ownership, grants, constraints, and account deletion', async t => {
  const db = new PGlite();
  try {
    // Supabase supplies these auth objects/roles in hosted projects.
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      grant usage on schema auth to anon, authenticated;
      insert into auth.users (id) values ('${userA}'), ('${userB}');
    `);
    await db.exec(fs.readFileSync('supabase/setup.sql', 'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${userA}', false);`);
    await t.test('authenticated users create only their own empty profile', async () => {
      await db.query('insert into public.profiles (id) values ($1) on conflict (id) do nothing', [userA]);
      await db.query('insert into public.profiles (id) values ($1) on conflict (id) do nothing', [userA]);
      await assert.rejects(db.query('insert into public.profiles (id) values ($1)', [userB]), /row-level security/);
      await assert.rejects(db.query('insert into public.profiles (id, name) values ($1, $2)', [userA, 'Injected']), /permission denied/);
      const { rows } = await db.query('select * from public.profiles');
      assert.equal(rows.length, 1);
      assert.equal(rows[0].agree, false);
      assert.equal(rows[0].terme_condition, false);
    });
    await t.test('own profile updates persist; ID changes and invalid fields fail', async () => {
      await db.query("update public.profiles set name = 'Test', sex = 'female', age = 18, agree = true, terme_condition = true where id = $1", [userA]);
      await assert.rejects(db.query('update public.profiles set id = $1 where id = $2', [userB, userA]), /permission denied/);
      await assert.rejects(db.query('update public.profiles set age = 121 where id = $1', [userA]), /check constraint/);
      await assert.rejects(db.query("update public.profiles set name = ' ' where id = $1", [userA]), /check constraint/);
      const { rows } = await db.query('select name, age from public.profiles where id = $1', [userA]);
      assert.equal(rows[0].name, 'Test');
      assert.equal(rows[0].age, 18);
    });
    await t.test('a second account cannot read or update the first account', async () => {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userB]);
      assert.equal((await db.query('select * from public.profiles')).rows.length, 0);
      await db.query('insert into public.profiles (id) values ($1)', [userB]);
      assert.equal((await db.query("update public.profiles set name = 'Changed' where id = $1 returning id", [userA])).rows.length, 0);
      const { rows } = await db.query('select id from public.profiles');
      assert.equal(rows.length, 1);
      assert.equal(rows[0].id, userB);
      await assert.rejects(db.query('delete from public.profiles where id = $1', [userB]), /permission denied/);
    });
    await t.test('anonymous access is denied', async () => {
      await db.exec('reset role; set role anon;');
      await assert.rejects(db.query('select * from public.profiles'), /permission denied/);
      await assert.rejects(db.query('insert into public.profiles (id) values ($1)', [userA]), /permission denied/);
    });
    await t.test('deleting an auth account removes its profile', async () => {
      await db.exec('reset role;');
      await db.query('delete from auth.users where id = $1', [userA]);
      assert.equal((await db.query('select * from public.profiles where id = $1', [userA])).rows.length, 0);
    });
  } finally {
    await db.close();
  }
});
