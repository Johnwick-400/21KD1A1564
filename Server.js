const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;


const URL = 'http://20.244.56.144/test/companies';


const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIyNDEyMTk4LCJpYXQiOjE3MjI0MTE4OTgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImM0MjM4NTg1LTEzMjAtNDk0Mi05ZTFjLTkxN2JhZDRjMTU2YiIsInN1YiI6InBhdmFudGVqdmVlc2FtMjZAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiTGVuZGkiLCJjbGllbnRJRCI6ImM0MjM4NTg1LTEzMjAtNDk0Mi05ZTFjLTkxN2JhZDRjMTU2YiIsImNsaWVudFNlY3JldCI6IklCT0lraGJYZ2JUa1lXTkIiLCJvd25lck5hbWUiOiJQYXZhbiBUZWphIiwib3duZXJFbWFpbCI6InBhdmFudGVqdmVlc2FtMjZAZ21haWwuY29tIiwicm9sbE5vIjoiMjFLRDFBMTU2NCJ9.OpgcPp10bzSxUj8AWojYtSim5N9dGx3KE9VvnAN6Ia0';
async function fetchProducts(company, category, minPrice, maxPrice, top, page = 1) {
    try {
        console.log(`Fetching products for company: ${company}, category: ${category}, minPrice: ${minPrice}, maxPrice: ${maxPrice}, top: ${top}, page: ${page}`);
        
        const response = await axios.get(`${URL}/${company}/categories/${category}/products`, {
            params: {
                top: top,
                minPrice: minPrice,
                maxPrice: maxPrice,
                page: page
            },
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        console.log(`Response from ${company}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching products from ${company}:`, error.message);
        throw error;
    }
}

app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    const { n, minPrice, maxPrice, page = 1, sortBy } = req.query;
    const top = parseInt(n, 10);
    const companyList = ["AMZ", "FLP", "SUP", "HYN", "AZO"];

    try {
        if (!top || top < 1 || top > 100) {
            return res.status(400).json({ error: 'Invalid value for parameter "n". Must be between 1 and 100.' });
        }

        const products = [];
        for (const company of companyList) {
            const data = await fetchProducts(company, categoryname, minPrice, maxPrice, top, page);
            products.push(...data);
        }

        const processedProducts = products.map((product, index) => ({
            id: `prod-${index}-${Date.now()}`,
            ...product
        }));

        if (sortBy) {
            const [key, order] = sortBy.split(':');
            processedProducts.sort((a, b) => {
                if (order === 'desc') {
                    return b[key] - a[key];
                } else {
                    return a[key] - b[key];
                }
            });
        }

        res.json(processedProducts.slice(0, top));
    } catch (error) {
        console.error('Error processing products:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { productid } = req.params;
    
    try {
       
        const product = {}; 
        res.json(product);
    } catch (error) {
        console.error('Error fetching product details:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
