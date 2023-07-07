export const getImageURLByPhrase = async (phrase: string): Promise<string> => {
    const apiKey = '34397078-7645236e8cfc56fb396627924';
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${phrase}&orientation=horizontal`);
        const data = await response.json();
        if (!data || !data.hits || data.hits.length <= 0) throw ''
        const sel = Math.floor(Math.random() * (data.hits.length - 0 + 1) + 0)
        const randomImageURL = data.hits[sel].webformatURL;
        return randomImageURL + ''
    } catch (Exception) {
        const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=study&orientation=horizontal`);
        const data = await response.json();
        if (!data || !data.hits || data.hits.length <= 0) return 'https://cdn.pixabay.com/photo/2020/05/13/13/32/video-conference-5167472_960_720.jpg'
        const sel = Math.floor(Math.random() * (data.hits.length - 0 + 1) + 0)
        const randomImageURL = data.hits[sel].webformatURL;
        return randomImageURL + ''
    }
};
