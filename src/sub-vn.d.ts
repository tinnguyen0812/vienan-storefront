declare module 'sub-vn' {
  export interface Province {
    code: string;
    name: string;
    unit: string;
  }

  export interface District {
    code: string;
    name: string;
    unit: string;
    province_code: string;
  }

  export interface Ward {
    code: string;
    name: string;
    unit: string;
    district_code: string;
    province_code: string;
  }

  export function getProvinces(): Province[];
  export function getDistricts(): District[];
  export function getWards(): Ward[];
  export function getDistrictsByProvinceCode(provinceCode: string): District[];
  export function getWardsByDistrictCode(districtCode: string): Ward[];
  export function getWardsByProvinceCode(provinceCode: string): Ward[];
}
