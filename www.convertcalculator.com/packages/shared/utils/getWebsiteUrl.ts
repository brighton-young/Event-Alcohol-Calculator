type Props = {
  slug?: string;
  replaceLocalhost?: boolean;
  params?: Record<string, any>;
  isCached?: boolean;
};

export const getWebsiteUrlWithoutEnv = ({
  cacheUrl,
  rootUrl,
  slug = '/',
  replaceLocalhost = false,
  params = {},
  isCached = false,
}:
  | ({
      cacheUrl?: string;
      rootUrl?: string;
    } & Props)
  | undefined = {}) => {
  const [slugWithoutParams, paramsFromSlug] = slug.split('?');

  const cleanedSlug = slugWithoutParams
    .split('/')
    .filter((path) => {
      return !!path;
    })
    .join('/');

  const newRootUrl = isCached ? `${cacheUrl}/cache` : rootUrl;

  const urlWithoutParams = !cleanedSlug
    ? `${newRootUrl}/`
    : `${newRootUrl}/${cleanedSlug}/`;
  const urlWithParams = paramsFromSlug
    ? `${urlWithoutParams}?${paramsFromSlug}`
    : urlWithoutParams;

  const realUrl = new URL(urlWithParams);

  Object.entries(params).forEach(([key, value]) => {
    realUrl.searchParams.append(key, value);
  });

  if (replaceLocalhost) {
    return realUrl.href.replace('localhost', '127.0.0.1');
  }

  return realUrl.href;
};

const getWebsiteUrl = (props: Props) => {
  const cacheUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
  const rootUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return getWebsiteUrlWithoutEnv({ cacheUrl, rootUrl, ...props });
};

export default getWebsiteUrl;
