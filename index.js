import { createClient } from 'redis';
import express from 'express';
const app = express();
const port = 3000;

(async () => {
    const client = createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    app.get('/login', async (req, res) => {
        const { name, password } = req.query
        const user = await authUser(name, password)
        if (user) res.send({ user })
        else res.send({ message: "User not found" })
    })

    app.listen(port, () =>
        console.log(`Redis Api Login Listening at http://localhost:${port}`))

    const getUserIDByName = async name => await client.hGet('users', name)

    const authUser = async (name, password) => {
        const id = await getUserIDByName(name)
        const key = `user:${id}`
        if ((await client.hGet(key, 'password')) == password) {
            const fields = ['name', 'bio']
            const userInfo = await client.hmGet(key, fields)
            const user = {}
            fields.forEach((fields, i) => user[fields] = userInfo[i])
            return user
        }
    }
})();