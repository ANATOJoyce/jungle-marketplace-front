// app/routes/products.new.tsx
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useState, useRef } from "react";
import { ProductCategory } from "~/types/product-category";
import { ProductCollection } from "~/types/product-collection";
import { ProductTag } from "~/types/product-tag";
import { getSession } from "~/utils/session.server";

// Types
interface tag {
  id: string;
  value: string;
  metadata?: Record<string, unknown>;
  products?: string[]; // list of product ids
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  handle: string;
}

interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

interface LoaderData {
  tags: ProductTag[];
  categories: ProductCategory[];
  collections: ProductCollection[];
  defaultOptions: ProductOption[];
}

interface ActionData {
  success?: boolean;
  errors?: Record<string, string>;
  product?: any;
  message?: string;
}

// Loader function - Fetch real data from NestJS API
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("access_token");

    if (!token) {
      console.log("No token found, redirecting to login");
      return redirect("/login");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const API_URL = process.env.NEST_API_URL;

    if (!API_URL) {
      throw new Error("Missing PUBLIC_API_URL in environment variables");
    }

    console.log("Making API calls with token:", token ? "present" : "missing");

    // Fetch data from your NestJS API
    const [tagsRes, categoriesRes, collectionsRes] = await Promise.all([
      fetch(`${API_URL}/product/tags`, {
        headers,
        method: "GET",
      }).catch((err) => {
        console.error("Error fetching tags:", err);
        return { ok: false, status: 500, json: () => Promise.resolve([]) };
      }),
      fetch(`${API_URL}/product/categories`, {
        headers,
        method: "GET",
      }).catch((err) => {
        console.error("Error fetching categories:", err);
        return { ok: false, status: 500, json: () => Promise.resolve([]) };
      }),
      fetch(`${API_URL}/product/collections`, {
        headers,
        method: "GET",
      }).catch((err) => {
        console.error("Error fetching collections:", err);
        return { ok: false, status: 500, json: () => Promise.resolve([]) };
      }),
    ]);

    // Parse JSON if fetch succeeded
    const [tags, categories, collections] = await Promise.all([
      tagsRes.ok ? tagsRes.json() : [],
      categoriesRes.ok ? categoriesRes.json() : [],
      collectionsRes.ok ? collectionsRes.json() : [],
    ]);

    return { tags, categories, collections };
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load product data", { status: 500 });
  }
}


// Action function - Create product via NestJS API
export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("access_token");

    if (!token) {
      console.log("No token in action, redirecting to login");
      return redirect("/login");
    }

    // Handle file uploads
    const uploadHandler = unstable_createFileUploadHandler({
      maxPartSize: 5_000_000, // 5MB
      directory: "public/uploads",
      file: ({ filename }) => filename,
    });

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);

    // Extract form data
    const productData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      handle: formData.get("handle") as string,
      description: formData.get("description") as string,
      hasVariants: formData.get("hasVariants") === "on",
      categoryId: formData.get("categoryId") as string,
      collectionId: formData.get("collectionId") as string,
      tags: formData.getAll("tags") as string[],
      status: formData.get("status") as string || "draft",
    };

    // Handle product options/variants
    const options: ProductOption[] = [];
    const optionNames = formData.getAll("optionName") as string[];
    const optionValues = formData.getAll("optionValues") as string[];

    optionNames.forEach((name, index) => {
      if (name && optionValues[index]) {
        options.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          values: optionValues[index].split(",").map(v => v.trim()).filter(Boolean),
        });
      }
    });

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!productData.title) errors.title = "Title is required";
    if (!productData.categoryId) errors.categoryId = "Category is required";

    if (Object.keys(errors).length > 0) {
      return json<ActionData>({ errors, success: false }, { status: 400 });
    }

    // Prepare payload for NestJS API
    const apiPayload = {
      ...productData,
      options: productData.hasVariants ? options : [],
      variants: productData.hasVariants ? generateVariants(options) : [],
    };

    // Create product via NestJS API
    const createResponse = await fetch(`${process.env.NEST_API_URL}/product/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiPayload),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      
      if (createResponse.status === 401) {
        return redirect("/login");
      }

      return json<ActionData>({
        errors: errorData.errors || { general: "Failed to create product" },
        success: false,
      }, { status: createResponse.status });
    }

    const createdProduct = await createResponse.json();

    return json<ActionData>({
      success: true,
      product: createdProduct,
      message: "Product created successfully!",
    });

  } catch (error) {
    console.error("Action error:", error);
    
    return json<ActionData>({
      errors: { general: "An unexpected error occurred" },
      success: false,
    }, { status: 500 });
  }
}

// Helper function to generate variants from options
function generateVariants(options: ProductOption[]) {
  if (options.length === 0) return [];

  const combinations = options.reduce((acc, option) => {
    if (acc.length === 0) {
      return option.values.map(value => ({ [option.name]: value }));
    }

    const newCombinations = [];
    for (const combination of acc) {
      for (const value of option.values) {
        newCombinations.push({ ...combination, [option.name]: value });
      }
    }
    return newCombinations;
  }, [] as Record<string, string>[]);

  return combinations.map((combination, index) => ({
    id: `variant-${index}`,
    title: Object.values(combination).join(" / "),
    options: combination,
    sku: "",
    price: 0,
    compareAtPrice: null,
    inventory: 0,
  }));
}

export default function NewProductPage() {
  const { tags, categories, collections} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    file: File;
    preview: string;
  }>>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = navigation.state === "submitting";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: crypto.randomUUID(),
          file,
          preview: e.target?.result as string,
        };
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const addOption = () => {
    setOptions(prev => [...prev, {
      id: crypto.randomUUID(),
      name: "",
      values: [],
    }]);
  };

  const updateOption = (index: number, field: string, value: string | string[]) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Add Product
        </h1>
        <p className="text-gray-600">
          Create a new product for your store
        </p>
      </div>

      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{actionData.message}</p>
        </div>
      )}

      {actionData?.errors?.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{actionData.errors.general}</p>
        </div>
      )}

      <Form method="post" encType="multipart/form-data" className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue="Jacket"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {actionData?.errors?.title && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              defaultValue="Warm and cozy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
              Handle <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                /
              </span>
              <input
                type="text"
                id="handle"
                name="handle"
                defaultValue="jacket"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue="A warm and cozy jacket"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Media <span className="text-gray-500">(Optional)</span>
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Upload images
                </button>
                <p className="text-gray-500 text-sm">
                  Drag and drop images here or click to upload
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="media"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedImages.map((image) => (
                <div key={image.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(image.file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="ml-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="hasVariants"
              name="hasVariants"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasVariants" className="text-sm font-medium text-gray-900">
              Yes, this is a product with variants
            </label>
          </div>
          
          {!hasVariants && (
            <p className="text-sm text-gray-500 mb-4">
              When unchecked, we will create a default variant for you
            </p>
          )}
        </div>

        {/* Product Options */}
        {hasVariants && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product options</h3>
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Define the options for the product, e.g. color, size, etc.
            </p>

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Name
                      </label>
                      <input
                        type="text"
                        name="optionName"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. Color"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Values (comma separated)
                      </label>
                      <input
                        type="text"
                        name="optionValues"
                        value={option.values.join(', ')}
                        onChange={(e) => updateOption(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. Red, Blue, Green"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {option.values.map((value, valueIndex) => (
                      <span
                        key={valueIndex}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        {value}
                        <button
                          type="button"
                          onClick={() => {
                            const newValues = option.values.filter((_, i) => i !== valueIndex);
                            updateOption(index, 'values', newValues);
                          }}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove option
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSubmitting ? 'Creating Product...' : 'Create Product'}</span>
          </button>
        </div>
      </Form>
    </div>
  );
}