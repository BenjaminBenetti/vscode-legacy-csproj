export interface Converter<From, To> {
  convert(from: From): To;
}
