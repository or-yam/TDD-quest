require("dotenv").config();
const axios = require("axios");
const TEN_SECONDS = 10 * 1000;

const getToken = async (client) => {
    const user = {
        user: {
            username: "engine",
            email: "engine@wilco.work",
            password: "wilco1234",
        },
    };

    try {
        const loginRes = await client.post(`/api/users/login`, user);
        if (loginRes.data?.user?.token) {
            return loginRes.data.user.token;
        }
    } catch (e) {
        //User doesn't exists yet
    }

    const userRes = await client.post(`/api/users`, user);
    return userRes.data?.user?.token;
};

const tryCreateItem = async (client, title, image) => {
    const item = {
        item: {
            title,
            image,
            description: "description",
            tag_list: ["tag1"],
        },
    };

    try {
        await client.post(`/api/items`, item);
        return true
    } catch {
        return false
    }
};

const testItemsCreation = async () => {
    const client = axios.create({
        baseURL: `http://localhost:${process.env.PORT || 3000}`,
        timeout: TEN_SECONDS,
    });
    const token = await getToken(client);
    client.defaults.headers.common["Authorization"] = `Token ${token}`;

    const testAddValidItem = await tryCreateItem(client, "title1", "https://path.com/image.png")

    if (!testAddValidItem) {
        console.log(`=!=!=!=!= ERROR: Failed adding item with valid image path`);
        return false;
    }

    const testAddItemWithInvalidImageExtension = await tryCreateItem(client, "title1", "https://path.com/image.gif")

    if (!testAddItemWithInvalidImageExtension) {
        console.log(`=!=!=!=!= ERROR: Managed to add an item with 'gif' image`);
        return false;
    }

    const testAddItemWithNonURLImageParam = await tryCreateItem(client, "title1", "image.png")

    if (!testAddItemWithNonURLImageParam) {
        console.log(`=!=!=!=!= ERROR: Managed to add an item with invalid image URL`);
        return false;
    }

    return true;
};

testItemsCreation()
    .then((res) => process.exit(res ? 0 : 1))
    .catch((e) => {
        console.log("error while checking api: " + e);
        process.exit(1);
    });
