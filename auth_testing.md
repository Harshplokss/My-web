# Auth Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  is_admin: true,
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
db.progress.insertOne({
  user_id: userId,
  current_level: 1,
  current_question_index: 0,
  completed_levels: [],
  score: 0,
  badges: [],
  answers_log: [],
  started_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend
```bash
curl -X GET "$REACT_APP_BACKEND_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$REACT_APP_BACKEND_URL/api/progress" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$REACT_APP_BACKEND_URL/api/levels" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing (Playwright)
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://your-app.preview.emergentagent.com/dashboard")
```

## Quick Debug
```bash
mongosh --eval "use('test_database'); db.users.find().limit(2).pretty(); db.user_sessions.find().limit(2).pretty();"
```

## Success Indicators
- /api/auth/me returns user data
- Dashboard loads without redirect
- /api/levels returns 5 levels with unlock state
