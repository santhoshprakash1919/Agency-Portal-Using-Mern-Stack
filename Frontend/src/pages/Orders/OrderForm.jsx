import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import { formatCurrency } from "../../utils/formatters.js";

export default function OrderForm({
  customers,
  products,
  initialValues,
  onSubmit,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues:
      initialValues || {
        customer: "",
        storeName: "",
        customerName: "",
        phone: "",
        notes: "",
        product: products[0]?._id || "",
        quantity: 1,
      },
  });

  const productId = watch("product");
  const quantity = Number(watch("quantity") || 1);
  const selectedProduct = products.find((item) => item._id === productId);
  const subtotal = (selectedProduct?.price || 0) * quantity;
  const gstTotal = subtotal * ((selectedProduct?.gstPercent || 0) / 100);
  const grandTotal = subtotal + gstTotal;

  const customerOptions = useMemo(
    () => [
      { value: "", label: "Select customer (optional)" },
      ...customers.map((item) => ({ value: item._id, label: `${item.shopName} • ${item.phone}` })),
    ],
    [customers]
  );

  const productOptions = useMemo(
    () => [
      { value: "", label: "Select product" },
      ...products.map((item) => ({ value: item._id, label: `${item.name} • ${item.stock} in stock` })),
    ],
    [products]
  );

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;
    const selectedCustomer = customers.find((item) => item._id === customerId);
    setValue("customer", customerId);
    if (selectedCustomer) {
      setValue("storeName", selectedCustomer.shopName || "");
      setValue("customerName", selectedCustomer.ownerName || selectedCustomer.shopName || "");
      setValue("phone", selectedCustomer.phone || "");
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit((values) => onSubmit(values, selectedProduct, quantity))}>
      <div className="form-grid">
        <Select label="Customer" options={customerOptions} value={watch("customer")} onChange={handleCustomerChange} />
        <Select
          label="Product"
          options={productOptions}
          value={productId}
          onChange={(event) => setValue("product", event.target.value)}
        />
        <Input label="Store name" error={errors.storeName?.message} {...register("storeName", { required: "Store name is required" })} />
        <Input
          label="Customer name"
          error={errors.customerName?.message}
          {...register("customerName", { required: "Customer name is required" })}
        />
        <Input label="Phone" error={errors.phone?.message} {...register("phone", { required: "Phone is required" })} />
        <Input
          label="Quantity"
          type="number"
          min="1"
          error={errors.quantity?.message}
          {...register("quantity", { required: "Quantity is required", min: 1 })}
        />
        <div style={{ gridColumn: "1 / -1" }}>
          <Input label="Notes" as="textarea" rows={4} {...register("notes")} />
        </div>
      </div>

      <div className="panel" style={{ boxShadow: "none" }}>
        <div className="inline wrap" style={{ justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="inline wrap" style={{ justifyContent: "space-between" }}>
          <span>GST</span>
          <strong>{formatCurrency(gstTotal)}</strong>
        </div>
        <div className="inline wrap" style={{ justifyContent: "space-between" }}>
          <span>Grand total</span>
          <strong>{formatCurrency(grandTotal)}</strong>
        </div>
      </div>

      <Button type="submit" loading={isSubmitting}>
        Save order
      </Button>
    </form>
  );
}
