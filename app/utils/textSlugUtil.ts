export const textToSlug = (text: string) => {
    return text.toLocaleLowerCase().split(" ").join("-");
}

export const slugToText = (slug: string) => {
    return slug.split("-").map(text => text[0].toLocaleUpperCase() + text.slice(1)).join(" ");
}